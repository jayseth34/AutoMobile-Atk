import { Component, OnInit, computed, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PartyListRs, TransactionDetails, ItemDetail, Item, ItemListRs, SaveUpdateTransactionRq, ColumnInfo, PaymentInfo, Bank, GetBankRq, GetBankRs } from 'src/app/models';
import { STATE_LIST } from 'src/app/dummyData';
import { Party } from 'src/app/models';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { distinctUntilChanged, map, of, pairwise, startWith, Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { PaymentRefNoValidator, PaymentTypeValidator, ReceivedValidator } from 'src/app/received-validator';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { DataService } from 'src/app/services/data.service';

type BalanceColors = "green" | "red" | "black";

@Component({
  selector: 'app-edit-detail',
  templateUrl: './edit-detail.component.html',
  styleUrls: ['./edit-detail.component.css']
})
export class EditDetailComponent implements OnInit {
  // TransactionType = TransactionTypeEnum;
  transactionType: string;
  items = signal<Item[]>([]);
  selectedParty?: Party;
  currentInvNo?: number;
  stateList: string[];
  partyList: Party[];
  registeredPhoneNumber: number;
  isEdit: boolean = false; // False for add transaction and true for edit transaction
  invNo: number;
  isSaleConvert: boolean = false;
  isSaleOrderConvert: boolean = false;
  isPurchaseConvert: boolean = false;
  convertInvoiceNumber: number;
  deletedItem: Item;
  totalQuantity: number = 0;
  totalDiscount: number = 0
  totalTax: number = 0;
  totalAmount: number = 0;
  transactionId: number = 0;
  shippingAddressSame: boolean = false;
  balanceColor: BalanceColors;
  roundOff: boolean = true;
  fullpayment: boolean = false;
  showAmtDetails: boolean = true;
  paymentInfoInitialized: boolean = false;
  deletePayDisabled: boolean = true;
  ogBalance: number = 0;
  banks = signal<Bank[]>([
    {
      accountdisplayname: 'CASH',
      amount: 0,
      refno: '',
      type: 'CASH'
    },
    {
      accountdisplayname: 'CHEQUE',
      amount: 0,
      refno: '',
      type: 'CHEQUE'
    }
  ]);

  // Subscriptions
  $FormSubscription: Subscription[] = [];

  // For AutoComplete
  autoCompletePartyData: any[] = [];
  columnInfoAutoComplete: ColumnInfo[] = [
    {
      columnName: "Party Name",
      isColoured: false,
      identifier: "partyName"
    },
    {
      columnName: "Balance",
      isColoured: true,
      identifier: "balance"
    }
  ];

  autoCompleteItemData = computed(() => {
    return this.items().map((item) => {
      return {
        'itemName': item.itemname,
        'salePrice': item.saleprice,
        'purchasePrice': item.purchaseprice,
        'stock': item.remainingquantity,
        'location': ''
      };
    });
  });

  bankNameList = computed(() => {
    return this.banks().map((bank) => bank.accountdisplayname ?? bank.type);
  });

  itemColumnInfo: ColumnInfo[] = [
    {
      columnName: "Item Name",
      isColoured: false,
      identifier: "itemName"
    },
    {
      columnName: "Sale Price",
      isColoured: false,
      identifier: "salePrice"
    },
    {
      columnName: "Purchase Price",
      isColoured: false,
      identifier: "purchasePrice"
    },
    {
      columnName: "Stock",
      isColoured: true,
      identifier: "stock"
    },
    {
      columnName: "Location",
      isColoured: false,
      identifier: "location"
    }
  ];

  // For Item Table
  // itemDataForm: FormGroup;
  modifyDetail: FormGroup;
  newTransactionData = new MatTableDataSource<any>();
  newTransactionDataHeaders = ["Id", "Item", "Quantity", "Unit", "Price/unit", "Discount", "Tax", "Amount"];
  newTransactionDataColumns = ["id", "item", "quantity", "unit", "price", "discountPercent", "discountAmount", "taxPercent", "taxAmount", "totalAmount"];

  // For Footer
  paymentForm: FormGroup;

  UNITS = [
    "None",
    "pac",
    "PCS",
    "Kg"
  ]

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, public cs: CommonService, public _location: Location, public dataservice: DataService) { }

  public get itemDetailValue(): AbstractControl[] {
    return (this.modifyDetail.get("itemdetailslist") as FormArray).controls.filter((item) => item.status != "DISABLED");
  }

  public get partyBalance(): number {
    return this.modifyDetail.get("partybalance")?.value;
  }
  
  public get itemReceivedAmt() : number {
    return this.modifyDetail.get("received")?.value;
  }
  
  public get paymentInfoValue() {
    return (this.modifyDetail.get("amountdetailslist") as FormArray<FormGroup>);
  }

  public getBankAccountName(i: number): string {
    return (this.modifyDetail.get('amountdetailslist') as FormArray).at(i).get('type')?.value;
  }

  
  getItemName(item: Item): string {
    return item.itemname
  }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") ?? ""));
    this.currentInvNo = parseInt(localStorage.getItem("curInvCount") ?? "");
    this.dataservice.isLogin = true
    // Initializing the Form Group with default values
    this.modifyDetail = new FormGroup({
      customername: new FormControl(null, [Validators.required, Validators.minLength(1)]),
      phonenumber: new FormControl("", [Validators.minLength(9), Validators.maxLength(10)]),
      billingaddress: new FormControl(""),
      shippingaddress: new FormControl(""),
      invoicedate: new FormControl({ value: this.cs.formatDate(new Date()), disabled: false }),
      stateofsupply: new FormControl({ value: "Maharashtra", disabled: false }),
      partybalance: new FormControl(0),
      invoicenumber: new FormControl({ value: this.currentInvNo, disabled: false }),
      paymenttype: new FormControl("CASH"),
      paymentstatus: new FormControl("UNPAID"),
      received: new FormControl<number>({ value: 0, disabled: false }),
      total: new FormControl<number>({ value: 0, disabled: false }),
      balance: new FormControl<number>({ value: 0, disabled: true }),
      topayparty: new FormControl<number>(0),
      toreceivefromparty: new FormControl<number>(0),
      itemdetailslist: new FormArray([]),
      amountdetailslist: new FormArray([], PaymentTypeValidator)
    }, ReceivedValidator);

    this.modifyDetail.get("partybalance")?.disable();

    // If Total changed, then update received accordingly
    this.modifyDetail.get("total")?.valueChanges.subscribe((val) => {
      if (this.fullpayment)
        this.modifyDetail.get("received")?.setValue(val);
      else {
        let rec = this.modifyDetail.get("received")?.value;
        this.modifyDetail.get("balance")?.setValue(val - rec, { emitEvent: false });
      }
    });

    // If Received value changed, then update the balance accordingly
    this.modifyDetail.get("received")?.valueChanges.subscribe((val) => {
      let total = this.modifyDetail.get("total")?.value;
      this.modifyDetail.get("balance")?.setValue(total - val, { emitEvent: false });

      // Update the payment amount when only 1 payment type available
      let paymentArr = this.modifyDetail.get("amountdetailslist") as FormArray;
      if(paymentArr.length == 1){
        paymentArr.at(0).get('amount')?.setValue(val, { emitEvent: false });
      }
    });

    // If Payment info length changed
    this.modifyDetail.get('amountdetailslist')?.valueChanges
    .subscribe((val: FormArray) => {
      if(val.length <= 1)
        this.deletePayDisabled = true;
      else
        this.deletePayDisabled = false;
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      // Setting the page type - Add Sale or Edit Sale
      if (params.has("type")) {
        this.transactionType = params.get("type") as string;
        if (this.transactionType == "Sale") {
          this.modifyDetail.get("state")?.disable();
          this.modifyDetail.get("invoicenumber")?.disable();
          this.modifyDetail.get("invoicedate")?.disable();
        } else if (this.transactionType == "Sale-Order" || this.transactionType == 'Purchase-Order' || this.transactionType == 'Delivery-Challan'  || this.transactionType === 'Estimate-Quotation'){
          this.showAmtDetails = false;
        }

        // Check for the function type whether edit or convert
        if(params.has("fnType")){
          let fnType = params.get("fnType");

          if((this.transactionType === 'Sale-Order' || this.transactionType === 'Delivery-Challan' || this.transactionType === 'Estimate-Quotation') && fnType == 'convert'){
            this.isSaleConvert = true;
            if(params.has("invoiceNo"))
              this.convertInvoiceNumber = parseInt(params.get("invoiceNo") ?? "");
            else
              this._location.back();
          } else if (this.transactionType === 'Purchase-Order' && fnType == 'convert'){
            this.isPurchaseConvert = true;
            if(params.has("invoiceNo"))
              this.convertInvoiceNumber = parseInt(params.get("invoiceNo") ?? "");
            else
              this._location.back();
          } else if (this.transactionType === 'Estimate-Quotation' && fnType == 'convertOrder'){
            this.isSaleOrderConvert = true;
            if(params.has("invoiceNo")){
              this.convertInvoiceNumber = parseInt(params.get("invoiceNo") ?? "");
            } else 
              this._location.back();
          }


          // Show Amt details when sale convert or purchase convert
          // Handle condition for estimate/ quotation where convert to sale order is present
          if(fnType == 'convert' && !this.isSaleOrderConvert)
            this.showAmtDetails = true
        }
      }
      else {
        // Route them back
        this._location.back();
      }


      if (params.has("invoiceNo")) {
        // If param contain invoice number, then we are editing sale.
        // We get the values from API and then bind it to the formcontrols
        this.isEdit = true;
        this.modifyDetail.get("partyname")?.disable();
        this.invNo = parseInt(params.get("invoiceNo") ?? "");
        // Getting details from api and setting the values
        this.api.getTransactionDetails(this.registeredPhoneNumber, this.invNo, this.transactionType.replace("-", " "), this.isSaleConvert, this.isSaleOrderConvert)
          .subscribe((transaction: TransactionDetails) => {
            if(transaction.status != 'SUCCESS'){
              Swal.fire(transaction.status, "", "error").then(_ => this._location.back());
            }
            this.modifyDetail.patchValue({
              customername: transaction.customername,
              phonenumber: transaction.phonenumber,
              billingaddress: transaction.billingaddress,
              invoicedate: this.cs.formatDate(new Date(transaction.invoicedate)),
              state: transaction.stateofsupply,
              invoicenumber: transaction.invoicenumbercount,  
              paymenttype: transaction.paymenttype,
              total: transaction.total,
              received: transaction.received,
              balance: transaction.balance,
              topayparty: transaction.topayparty,
              toreceivefromparty: transaction.toreceivefromparty,
              partybalance: transaction.toreceivefromparty - transaction.topayparty,
            });

            this.ogBalance = transaction.balance ?? 0;

            this.updateBalanceColor(transaction.toreceivefromparty - transaction.topayparty);
            transaction.itemdetailslist.forEach(item => this.addNewFormRow(this.createNewFormRow(item)));
            transaction.amountdetailslist.forEach(bank => this.createNewPaymentRow(bank));
            // For the extra row
            this.addNewFormRow(this.createNewFormRow(null));
            this.updateTransactionData();
          });
      } else {
        this.addNewFormRow(this.createNewFormRow(null));
        this.updateTransactionData();

        // To add the payment type with defalt value being cash
        this.createNewPaymentRow();
      }
    });
  }

  updateTransactionData() {
    this.newTransactionData.data = this.itemDetailValue;
  }

  createNewFormRow(data: ItemDetail | null): FormGroup {
    let finalAmount = 0
    let totalElementControl = this.modifyDetail.get("total");
    if (data != null) {
      // TODO: Add default tax amount from item to totalAmount
      // TODO: Handle user input for item name. Currently when not selected, all the input are not editable
      finalAmount = data?.priceperunit * data.qty + 0 - data?.discountamount;
      this.totalAmount += finalAmount;
      this.totalQuantity += data.qty;
      totalElementControl?.setValue(this.totalAmount, { emitevent: false });
    }

    if (this.transactionId == 0 && data != null)
      this.transactionId = data.transactionid;
    let element = new FormGroup({
      transactionid: new FormControl(this.transactionId),
      item: new FormControl(data?.item ?? ""),
      qty: new FormControl(data?.qty ?? 0, Validators.min(0)),
      initialCount: new FormControl({ value: data?.qty ?? 0, disabled: data ? true: false }),
      unit: new FormControl({ value: data?.unit ? data?.unit : "None", disabled: data ? true: false }),
      priceperunit: new FormControl({ value: data?.priceperunit ?? 0.0, disabled: data ? true: false }),
      discountpercent: new FormControl(data?.discountpercent ?? 0.0),
      discountamount: new FormControl(data?.discountamount ?? 0.0),
      taxrate: new FormControl(data?.taxrate ?? 0.0),
      taxrateamount: new FormControl(data?.taxrateamount ?? 0.0),
      totalAmount: new FormControl({ value: finalAmount, disabled: true }),
      queryoperationtype: new FormControl(data != null ? "UPDATE" : "INSERT"),
      remainingquantity: new FormControl(data?.remainingquantity ?? 0)
    });

    // this.updatePayAmount();

    // Setting the substriber to get previous and next value
    // Using pairwise to club two changes together.
    // writing startWith() to specify the first change

    // using distinctUntilChanged because the function get called two times
    // Error can be two subscriptions but I don't know ??
    element.get("item")?.valueChanges.pipe(distinctUntilChanged(), startWith(data?.item ?? ""), pairwise()).subscribe(([prev, next]: [any, any]) => this.handleItemChange(prev, next, element));
    const valueChanges$ = element.valueChanges.pipe(map((item: any) => this.getChangesNew(element)));
    valueChanges$.subscribe((changeObj: any) => {
      if (!element.value.queryoperationtype) {
        element.patchValue({
          queryoperationtype: "UPDATE"
        }, { emitEvent: false });
      }

      Object.keys(changeObj).forEach((key: string) => {
        const pricePerUnit = element.get("priceperunit")?.value as number;
        const discountPer = element.get("discountpercent")?.value as number;
        const discountAmt = element.get("discountamount")?.value as number;
        const taxPer = element.get("taxrate")?.value as number;
        const itemQty = element.get("qty")?.value as number;
        const taxAmt = element.get("taxrateamount")?.value as number;
        // const remainingquantity = element.get("remainingquantity")?.value as number;
        // const initialCount = element.get("initialCount")?.value as number;
        switch (key) {
          case "qty":
            // console.log(discountPer, pricePerUnit);
            const iscountAmtQty = ((discountPer * pricePerUnit) / 100) * changeObj[key]
            // console.log(iscountAmtQty);
            const newTaxAmtQty = ((taxPer * pricePerUnit) / 100) * changeObj[key];
            element.patchValue({
              discountamount: iscountAmtQty,
              taxrateamount: newTaxAmtQty,
              totalAmount: (pricePerUnit * changeObj[key]) - iscountAmtQty + taxAmt,
              // "remainingquantity": remainingquantity - (changeObj[key] - initialCount)
            }, { emitEvent: false });
            break;
          
          case "priceperunit":
            const newDiscountAmtPnP = ((discountPer * changeObj[key]) / 100) * itemQty;
            const newTaxAmtPnP = ((taxPer * changeObj[key]) / 100) * itemQty;
            element.patchValue({
              discountamount: newDiscountAmtPnP,
              taxrateamount: newTaxAmtPnP,
              totalAmount: (changeObj[key] * itemQty) - discountAmt + taxAmt,
            }, { emitEvent: false });
            break;

          case "discountamount":
            const newPricePerUnitDisc = changeObj[key] / itemQty;
            element.patchValue({
              discountpercent: (newPricePerUnitDisc / pricePerUnit) * 100,
              totalAmount: (pricePerUnit * itemQty) - changeObj[key] + taxAmt
            }, { emitEvent: false });
            break;

          case "discountpercent":
            const newDiscountAmt = (changeObj[key] / 100) * itemQty * pricePerUnit;
            element.patchValue({
              discountamount: newDiscountAmt,
              totalAmount: (pricePerUnit * itemQty) - newDiscountAmt + taxAmt
            }, { emitEvent: false });
            break;

          case "taxrateamount":
            const newPricePerUnitTax = changeObj[key] / itemQty;
            element.patchValue({
              taxrate: (newPricePerUnitTax / pricePerUnit) * 100,
              totalAmount: (pricePerUnit * itemQty) + changeObj[key] - discountAmt
            }, { emitEvent: false });
            break;

          case "taxrate":
            const newTaxAmt = (changeObj[key] / 100) * itemQty * pricePerUnit;
            element.patchValue({
              taxrateamount: newTaxAmt,
              totalAmount: (pricePerUnit * itemQty) - discountAmt + newTaxAmt
            }, { emitEvent: false });
            break;
        }
        this.calcTotalVal();
      });
    });

    return element;
  }

  createNewPaymentRow(data?: Bank) {
    let control = this.modifyDetail.get("amountdetailslist") as FormArray;
    let defaltValue = this.bankNameList()[0];

    // console.log(this.banks());

    if(this.banks().length >= 1){
      // console.log("Updating banks array");
      this.banks.update(banks => banks.slice(1))
      // console.log('New Bank List: ', this.banks());
    }

    if (this.banks.length <= 1 && !this.paymentInfoInitialized){
      // console.log("Getting Bank names");
      this.handlePaymentInputClick();
    }

    // if(bankListString && this.banks.)

    let nfg = new FormGroup({
      type: new FormControl<string>((data?.accountdisplayname ?? data?.type) ?? defaltValue),
      amount: new FormControl<number>(data?.amount ?? 0),
      refno: new FormControl<string>(data?.refno ?? "")
    }, PaymentRefNoValidator);

    let $amtSubs = nfg.get("amount")?.valueChanges
    .pipe(startWith(data?.amount), pairwise())
    .subscribe(amt => {
      this.modifyDetail.patchValue({
      received: this.itemReceivedAmt + (amt[1] ?? 0) - (amt[0] ?? 0),
      });
    });

    let $typeSubs = nfg.get("type")?.valueChanges
    .pipe(startWith(defaltValue), pairwise())
    .subscribe(type => {
      // console.log('Change Type: ', type)
      this.banks.update((items) => {
        let filteredItems = items.filter(item => item.accountdisplayname != type[1]);
        let obj: Bank = {
          accountdisplayname: "",
          amount: 0,
          refno: "",
          type: "",
        };
        let addItem: boolean = true;

        switch(type[0]){
          case 'CASH':
            obj.accountdisplayname = 'CASH';
            break;
          case "CHEQUE":
            obj.accountdisplayname = 'CHEQUE';
            break;
          default:
            if(type[0])
              obj.accountdisplayname = type[0];
            else
              addItem = false;
            break;
        }

        if (addItem)
          return [...filteredItems, obj];
        else 
          return [...filteredItems];
      })
    })

    if($amtSubs)
      this.$FormSubscription.push($amtSubs);
    control.push(nfg);
  }

  addNewFormRow(row: FormGroup) {
    let control = this.modifyDetail.get("itemdetailslist") as FormArray;
    control.push(row);
  }

  calcTotalVal() {
    let tempTotalValObj = {
      "qty": 0,
      "disc": 0,
      "tax": 0,
      "amt": 0
    };
    tempTotalValObj = this.itemDetailValue.reduce((total: any, currVal: any) => {
      total["qty"] += currVal.get("qty").value;
      total["disc"] += currVal.get("discountamount").value;
      total["tax"] += currVal.get("taxrateamount").value;
      total["amt"] += currVal.get("totalAmount").value;
      return total;
    }, tempTotalValObj);
    this.totalAmount = tempTotalValObj.amt;
    this.totalDiscount = tempTotalValObj.disc;
    this.totalQuantity = tempTotalValObj.qty;
    this.totalTax = tempTotalValObj.tax;

    this.modifyDetail.get("total")?.setValue(this.totalAmount, { emitevent: false });
  }

  updatePayAmount() {
    this.fullpayment = !this.fullpayment;
    console.log("pay Amoumt: " + this.fullpayment);
    const control = this.modifyDetail.get("received");
    let received: number;
    let balance: number;
    let paymentStatus: string;
    if (!this.fullpayment) {
      control?.enable();
      received = 0;
      balance = this.totalAmount - received
      paymentStatus = "UNPAID";
    } else {
      control?.disable();
      received = this.totalAmount;
      balance = 0
      paymentStatus = "UNPAID";
    }
    this.modifyDetail.patchValue({
      received: received,
      total: this.totalAmount,
      balance: balance,
    }, { emitEvent: false })

    // Updating Payment array only if one payment type is present
    let paymentArr = this.modifyDetail.get('amountdetailslist') as FormArray;
    if(paymentArr.length == 1)
      paymentArr.at(0).get('amount')?.setValue(received, { emitEvent: false });
  }

  getChangesNew(item1: FormGroup) {
    // To get the changes when the formcontrol is updated.
    // Input - The formgroup
    // Output - The values that have been changed into an object

    // The changed values of formcontrol in formgroup have their dirty property set. 
    const constObj = Object.entries((item1 as FormGroup).controls);
    const changeObj = constObj.reduce((acc: any, currVal: any) => {
      if (currVal[1].dirty) {
        return { ...acc, [currVal[0]]: currVal[1].value };
      }
      return acc;
    }, {});

    // Need to mark them as not dirty for the next call.
    item1.markAsPristine();
    return changeObj
  }

  handleDeleteRowClick(ind: number, element: FormControl) {
    // if(element.g)
    let control = this.itemDetailValue?.at(ind);
    if (control?.get("queryoperationtype")?.value == "INSERT")
      (this.modifyDetail.get("itemdetailslist") as FormArray)?.removeAt(ind);
    else {
      element.patchValue({
        queryoperationtype: "DELETE",
      });
      this.handleItemChangeRow(element);
    }
    // this.itemDetailValue?.at(ind).disable()
    // this.itemDetailValue.removeAt(ind);
    this.updateTransactionData();
  }

  handleDeletePaymentInfoClick(ind: number){
    let paymentFormArray = this.paymentInfoValue;
    let paymentControl = paymentFormArray.at(ind);
    let currAccDisplayName = paymentControl.get("type")?.value;
    let currAccAmt = paymentControl.get('amount')?.value;

    let receivedAmt = this.modifyDetail.get('received')?.value;

    this.modifyDetail.patchValue({
      received: receivedAmt - currAccAmt,
    });

    this.paymentInfoValue.removeAt(ind);

    let banksList: Bank[] = JSON.parse(localStorage.getItem('bankList') ?? "");
    if(banksList.length == 0)
      console.error("Nothing to delete in banklist");

    let bank = banksList.find((bank) => bank.accountdisplayname === currAccDisplayName);
    if (bank != undefined)
      this.banks.update((banks) => [...banks, bank as Bank]);
    else if (currAccDisplayName === 'CASH' || currAccDisplayName === 'CHEQUE'){
      let newItem: Bank = {
        accountdisplayname: currAccDisplayName,
        amount: 0,
        refno: '',
        type: currAccDisplayName
      }
      this.banks.update((banks) => [...banks, newItem]);
    }
  }

  handleAddRowClick() {
    this.addNewFormRow(this.createNewFormRow(null));
    this.updateTransactionData();
  }

  handleCustomerInputClick = () => {
    // api call
    // Getting the parties data
    if (this.partyList == null || this.partyList == undefined) {
      this.api.getPartyList(this.registeredPhoneNumber).subscribe((res: PartyListRs) => {
        this.partyList = res.getPartyList;
        this.autoCompletePartyData = this.partyList.map((val: Party) => {
          return {
            "partyName": val.partyname,
            "balance": val.toreceivefromparty - val.topayparty
          }
        })
      });
    }
  }

  handleStateInputClick() {
    console.log("State clicked");
    this.stateList = STATE_LIST
  }

  handlePaymentInputClick(){
    let bankListString = localStorage.getItem('bankList');
    let bankList: Bank[] = [];
    const paymentInfoList = this.paymentInfoValue.value.map(item => item.type);
  
    if (!bankListString){

      let rq: GetBankRq = {
        registeredphonenumber: this.registeredPhoneNumber
      }

      this.api.getBankList(rq).subscribe((rs: GetBankRs) => {
        if(rs.status === 'SUCCESS'){
          localStorage.setItem("bankList", JSON.stringify(rs.bankslist));
          bankList = rs.bankslist;
          bankList.map(bank => {
            let bankName = bank.accountdisplayname ?? (bank.type ?? "")
            if(!paymentInfoList.includes(bankName) && this.bankNameList().indexOf(bankName) == -1){
              this.banks.update(banks => [...banks, bank]);
            }
          });
          this.paymentInfoInitialized = true;
          // console.log('Bank list after fetching: ', this.banks());
        } else {
          Swal.fire(`Could not get Bank list: ${rs.statusmessage}`, "", "error");
        }
      });
    } else {
      bankList = JSON.parse(bankListString);
      bankList.map(bank => {
        let bankName = bank.accountdisplayname ?? (bank.type ?? "")
        if(!paymentInfoList.includes(bankName) && this.bankNameList().indexOf(bankName) == -1){
          this.banks.update(banks => [...banks, bank]);
        }
        this.paymentInfoInitialized = true;
      });
      // console.log('Bank list after locastorage: ', this.banks());
    }
  }

  handlePartyChange = (partyName: string) => {
    this.selectedParty = this.partyList.find((party: Party) => party.partyname === partyName);
    if (this.selectedParty != undefined) {
      let balance = this.selectedParty.toreceivefromparty - this.selectedParty.topayparty;
      this.modifyDetail.patchValue({
        phonenumber: this.selectedParty.phonenumber,
        billingaddress: this.selectedParty.billingaddress,
        shippingaddress: this.selectedParty.shipppingaddress ?? "",
        partybalance: balance,
        topayparty: this.selectedParty.topayparty,
        toreceivefromparty: this.selectedParty.toreceivefromparty
      });
      this.updateBalanceColor(balance);
    }
  }

  updateBalanceColor(balance: number) {
    if (balance < 0)
      this.balanceColor = "red";
    else if (balance > 0)
      this.balanceColor = "green";
    else
      this.balanceColor = "black";
  }

  getItems() {
    if (this.items() == undefined || this.items().length == 0) {
      const itemNameList = this.itemDetailValue.map(item => item.get("item")?.value);
      this.api.getItemList(this.registeredPhoneNumber).subscribe((res: ItemListRs) => {
        localStorage.setItem("itemList", JSON.stringify(res.getItemList));
        res.getItemList.map((item) => {
          if (!itemNameList.includes(item.itemname)) {
            this.items.update((items) => [...items, item]);
          }
        });
      });
    }
  }

  hasValue(arr: any, value: any): boolean {
    if (arr == null || value == null || arr.length == 0)
      return false;
    return arr.some((element: any) => element.itemname === value);
  }

  goToSaleInvoice() {
    this.dataservice.isLogin = false
    this.router.navigate([this.transactionType]);
  }

  handleItemChange(prev: any, next: any, element: any) {
    // Removing the next(new) value from the items array
    const ind = this.items().findIndex((item: Item) => item.itemname === next)
    let newItem: Item;
    if (ind < 0){
      newItem = {
        baseunit: '',
        discountonsaleprice: 0,
        itemname: next,
        minimumwholesalequantity: 0,
        percentageoramounttype: 0,
        purchaseprice: 0,
        remainingquantity: 0,
        saleprice: 0,
        wholesaleprice: 0,
      }

      element.get('priceperunit').enable();
      element.get('discountpercent').enable();
      element.get('discountamount').enable();
      element.get('taxrate').enable();
      element.get('taxrateamount').enable();
    } else {
      newItem = this.items()[ind];
      this.items.update(items => items.filter((item, index) => index != ind));

      element.get('priceperunit').disable();
      element.get('discountpercent').disable();
      element.get('discountamount').disable();
      element.get('taxrate').disable();
      element.get('taxrateamount').disable();
    }

    // Adding the previous (old) item to the items list
    const arr: Item[] = JSON.parse(localStorage.getItem("itemList") ?? "")
    let prevItem = arr.find((item: Item) => item.itemname === prev);
    if (prevItem)
      this.items.update(items => [...items, prevItem as Item]);

    this.handleItemChangeRow(element, newItem);
  }

  compareItems(item1: Item, item2: Item) {
    console.log("Called");
    return item1.itemname === item2.itemname;
  }

  handleItemChangeRow(element: any, item?: Item) {
    // Calculating the required amt
    // Deleting the previous value
    this.totalAmount -= element.get("totalAmount").value;
    this.totalDiscount -= element.get("discountamount").value;
    this.totalQuantity -= element.get("qty").value;

    // TODO: Tax calculation required.

    // Updating the row containing the new element
    if (item) {
      // If item is present, then perform calc.
      
      let discountPercent, discountAmt;
      if(item?.percentageoramounttype == "Percentage"){
        discountPercent = item?.discountonsaleprice;
        discountAmt = item.saleprice * (discountPercent/100);
      }
      else{
        discountAmt = item?.discountonsaleprice;
        discountPercent = ((item?.discountonsaleprice ?? 0) / (item?.saleprice ?? 0)) * 100;
      }

      const itemTotalAmt = (item?.saleprice ?? 0) - (discountAmt ?? 0);
      let receivedAmt = this.modifyDetail.get("received")?.value;

      if (Number.isNaN(discountPercent)) discountPercent = 0;

      this.totalAmount += itemTotalAmt;
      this.totalDiscount += discountAmt;``
      this.totalQuantity += 1;
      this.modifyDetail.get("total")?.setValue(this.totalAmount, { emitevent: false });
      element.patchValue({
        "qty": 1,
        "item": item.itemname,
        "unit": item.baseunit ?? "None",
        "priceperunit": item.saleprice ?? 0,
        "discountpercent": discountPercent,
        "discountamount": discountAmt,
        "taxrate": 0.0,
        "taxrateamount": 0.0,
        "totalAmount": itemTotalAmt,
      }, { emitEvent: false });
    }
  }

  submitDetails() {
    console.log(this.modifyDetail);
    if (!this.modifyDetail.valid) {
      console.log("Form not valid");
      console.log(this.modifyDetail.errors);
      Swal.fire("Enter Valid Detials", "", "info")
      return;
    }

    let body: SaveUpdateTransactionRq = this.modifyDetail.getRawValue();
    if (body.received === this.totalAmount) {
      body.paymentstatus = "PAID";
    }

    // console.log(body.toreceivefromparty);
    // Updating Party Balance
    switch(this.transactionType){
      case "Sale":
        body.toreceivefromparty += body.balance;
        if(this.isEdit)
          body.toreceivefromparty -= this.ogBalance;
        break;
      case "Purchase":
        //body.itemdetailslist.forEach(item => item.qty = -item.qty);
        body.topayparty += body.balance;
        if (this.isEdit)
          body.topayparty -= this.ogBalance;
        break;
      case "Sale-Order":
        body.convertinvoicenumber = this.convertInvoiceNumber;
        if(this.isSaleConvert){
          body.toreceivefromparty += body.balance;
          // Not testing for isEdit.. bcause the functionality is same as AddSale..
          // When creating sale-order, cannot increase receive amount so it will always be 0
          // Hence, no need to subtract ogBalance when converting because it will always be equal to full amt.
        }
        break;
      case "Purchase-Order":
        body.convertinvoicenumber = this.convertInvoiceNumber;
        if (this.isPurchaseConvert){
          // body.itemdetailslist.forEach(item => item.qty = -item.qty);
          body.topayparty += body.balance;
        }
        break;
      case "Delivery-Challan":
        body.convertinvoicenumber = this.convertInvoiceNumber;
        if(this.isSaleConvert){
          body.toreceivefromparty += body.balance;
        }
        break;
      case "Estimate-Quotation":
        body.convertinvoicenumber = this.convertInvoiceNumber;
        if(this.isSaleConvert)
          body.toreceivefromparty += body.balance;
        break;
      case "Sale-Return":
        body.topayparty += body.balance;
        if (this.isEdit)
          body.topayparty -= this.ogBalance;
        break;
      case "Purchase-Return":
        body.toreceivefromparty += body.balance;
        if (this.isEdit)
          body.toreceivefromparty -= this.ogBalance;
        break;
      default:
        console.log(`Invalid Transaction Type: ${this.transactionType}`);
        break;
    }

    // Updating the payment status
    if (body.received == body.total)
      body.paymentstatus = "PAID";
    else if (body.received == 0)
      body.paymentstatus = "UNPAID";
    else
      body.paymentstatus = "PARTIAL";

    body.issaleconvert = this.isSaleConvert;
    body.issaleorderconvert = this.isSaleOrderConvert;
    body.ispurchaseconvert = this.isPurchaseConvert;
    body.isupdate = this.isEdit;

    // Updating the payment type
    let paymentTypes = body.amountdetailslist.map((pi: PaymentInfo) => pi.type);
    body.paymenttype = paymentTypes.join(',');

    body.typeofpay = this.transactionType.replace("-", " ").toUpperCase();
    body.itemdetailslist = body.itemdetailslist.filter((val) => val.item.length > 0);
    body.registeredphonenumber = this.registeredPhoneNumber;
    console.log(body);

    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.PostUpdateSaleDetails(body, this.isEdit).subscribe(
          (res: any) => {
            if (res.status == "SUCCESS") {
              Swal.fire("Saved!", "", "success").then(_ => {
                this.router.navigateByUrl(`${this.transactionType}`) 
                this.dataservice.isLogin = false
            });
            }
            else
              Swal.fire("Changes are not saved", "", "error");
          });
      }
    });
  }
}
