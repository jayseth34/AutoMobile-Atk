import { Component, OnInit, computed, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PartyListRs, TransactionDetails, ItemDetail, Item, ItemListRs, SaveUpdateTransactionRq, ColumnInfo } from 'src/app/models';
import { STATE_LIST } from 'src/app/dummyData';
import { Party } from 'src/app/models';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { distinctUntilChanged, map, of, pairwise, startWith } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { ReceivedValidator } from 'src/app/received-validator';

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
  ogBalance: number = 0;

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
  });;
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

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, public cs: CommonService) { }

  public get itemDetailValue(): AbstractControl[] {
    return (this.modifyDetail.get("itemdetailslist") as FormArray).controls.filter((item) => item.status != "DISABLED");
  }

  public get partyBalance(): number {
    return this.modifyDetail.get("partybalance")?.value;
  }

  getItemName(item: Item): string {
    return item.itemname
  }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") ?? ""));
    this.currentInvNo = parseInt(localStorage.getItem("curInvCount") ?? "");
    // Initializing the Form Group with default values
    this.modifyDetail = new FormGroup({
      customername: new FormControl("", [Validators.required, Validators.minLength(1)]),
      phonenumber: new FormControl("", [Validators.required, Validators.minLength(9), Validators.maxLength(10)]),
      billingaddress: new FormControl("", [Validators.required, Validators.minLength(1)]),
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
    }, ReceivedValidator);

    this.modifyDetail.get("partybalance")?.disable();

    // If Total changed, then update received accordingly
    this.modifyDetail.get("total")?.valueChanges.subscribe((val) => {
      if (this.fullpayment)
        this.modifyDetail.get("received")?.setValue(val);
      else {
        let rec = this.modifyDetail.get("received")?.value;
        this.modifyDetail.get("balance")?.setValue(val - rec);
      }
    });

    // If Received value changed, then update the balance accordingly
    this.modifyDetail.get("received")?.valueChanges.subscribe((val) => {
      let total = this.modifyDetail.get("total")?.value;
      this.modifyDetail.get("balance")?.setValue(total - val);
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      // Setting the page type - Add Sale or Edit Sale
      if (params.has("type")) {
        this.transactionType = params.get("type") as string;
        if (this.transactionType == "Sale") {
          this.modifyDetail.get("state")?.disable();
        }
      }
      else {
        // Route them back
        this.router.navigateByUrl("Sale/sale-invoice");
      }

      if (params.has("invoiceNo")) {
        // If param contain invoice number, then we are editing sale.
        // We get the values from API and then bind it to the formcontrols
        this.isEdit = true;
        this.modifyDetail.get("partyname")?.disable();
        this.invNo = parseInt(params.get("invoiceNo") ?? "");
        // Getting details from api and setting the values
        this.api.getTransactionDetails(this.registeredPhoneNumber, this.invNo, "Sale", this.isSaleConvert, this.isSaleOrderConvert)
          .subscribe((transaction: TransactionDetails) => {
            this.modifyDetail.patchValue({
              customername: transaction.customername,
              phonenumber: transaction.phonenumber,
              billingaddress: transaction.billingaddress,
              invoicedate: this.cs.formatDate(new Date(transaction.invoicedate)),
              state: transaction.stateofsupply,
              invoicenumber: this.invNo,
              paymenttype: transaction.paymenttype,
              total: transaction.total,
              received: transaction.received,
              balance: transaction.balance,
              topayparty: transaction.topayparty,
              toreceivefromparty: transaction.toreceivefromparty,
              partybalance: transaction.toreceivefromparty - transaction.topayparty,
            });

            this.ogBalance = transaction.balance ?? 0;

            console.log(this.modifyDetail.get("toreceivefromparty")?.value);
            this.updateBalanceColor(transaction.toreceivefromparty - transaction.topayparty);
            transaction.itemdetailslist.forEach(item => this.addNewFormRow(this.createNewFormRow(item)));
            // For the extra row
            this.addNewFormRow(this.createNewFormRow(null));
            this.updateTransactionData();
          });
      } else {
        this.addNewFormRow(this.createNewFormRow(null));
        this.updateTransactionData();
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
      finalAmount = data?.priceperunit * data.qty + 0 - 0;
      this.totalAmount += finalAmount;
      this.totalQuantity += data.qty;
      totalElementControl?.setValue(this.totalAmount, { emitevent: false });
    }

    if (this.transactionId == 0 && data != null)
      this.transactionId = data.transactionid;
    let element = new FormGroup({
      transactionid: new FormControl(this.transactionId),
      item: new FormControl(data?.item ?? ""),
      qty: new FormControl(data?.qty ?? 0),
      initialCount: new FormControl({ value: data?.qty ?? 0, disabled: true }),
      unit: new FormControl({ value: data?.unit ? data?.unit : "None", disabled: true }),
      priceperunit: new FormControl({ value: data?.priceperunit ?? 0.0, disabled: true }),
      discountpercent: new FormControl(data?.discountpercent ?? 0.0),
      discountamount: new FormControl(data?.discountamount ?? 0.0),
      taxrate: new FormControl(data?.discountamount ?? 0.0),
      taxrateamount: new FormControl(data?.discountamount ?? 0.0),
      totalAmount: new FormControl({ value: finalAmount, disabled: true }),
      queryoperationtype: new FormControl(data != null ? "" : "INSERT"),
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

            console.log(discountPer, pricePerUnit);
            const iscountAmtQty = ((discountPer * pricePerUnit) / 100) * changeObj[key]
            console.log(iscountAmtQty);
            const newTaxAmtQty = ((taxPer * pricePerUnit) / 100) * changeObj[key];
            element.patchValue({
              discountamount: iscountAmtQty,
              taxrateamount: newTaxAmtQty,
              totalAmount: (pricePerUnit * changeObj[key]) - iscountAmtQty + taxAmt,
              // "remainingquantity": remainingquantity - (changeObj[key] - initialCount)
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
    console.log("helloworld");
    this.router.navigateByUrl("Sale/sale-invoice");
  }

  handleItemChange(prev: any, next: any, element: any) {
    // console.log(`Called with parameters: ${prev} and ${next}`);
    // Removing the next(new) value from the items array
    const ind = this.items().findIndex((item: Item) => item.itemname === next)
    if (ind < 0)
      return;
    const newItem: Item = this.items()[ind];
    this.items.update(items => items.filter((item, index) => index != ind));

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
      const itemTotalAmt = (item?.saleprice ?? 0) - (item?.discountonsaleprice ?? 0);
      let discountPercent = ((item?.discountonsaleprice ?? 0) / (item?.saleprice ?? 0)) * 100;
      let receivedAmt = this.modifyDetail.get("received")?.value;

      if (Number.isNaN(discountPercent)) discountPercent = 0;

      this.totalAmount += itemTotalAmt;
      this.totalDiscount += item.discountonsaleprice;
      this.totalQuantity += 1;
      this.modifyDetail.get("total")?.setValue(this.totalAmount, { emitevent: false });
      element.patchValue({
        "qty": 1,
        "item": item.itemname,
        "unit": item.baseunit ?? "None",
        "priceperunit": item.saleprice ?? 0,
        "discountpercent": discountPercent,
        "discountamount": item.discountonsaleprice,
        "taxrate": 0.0,
        "taxrateamount": 0.0,
        "totalAmount": itemTotalAmt,
      }, { emitEvent: false });
    }
  }

  submitDetails() {
    if (!this.modifyDetail.valid) {
      console.log("Form not valid");
      console.log(this.modifyDetail.errors);
      return;
    }

    let body: SaveUpdateTransactionRq = this.modifyDetail.getRawValue();
    if (body.received === this.totalAmount) {
      body.paymentstatus = "PAID";
    }

    console.log(body.toreceivefromparty);
    // Updating Party Balance
    if (this.transactionType == "Sale") {
      body.toreceivefromparty += body.balance;
      if (this.isEdit)
        body.toreceivefromparty -= this.ogBalance;
    } else {
      body.topayparty += body.balance;
      if (this.isEdit)
        body.topayparty -= this.ogBalance;
    }

    // Updating the payment status
    if (body.received == body.total)
      body.paymentstatus = "PAID";

    body.isconvert = this.isSaleConvert;
    body.isupdate = this.isEdit;

    body.typeofpay = this.transactionType.toUpperCase();
    body.itemdetailslist = body.itemdetailslist.filter((val) => val.item.length > 0);
    body.registeredphonenumber = this.registeredPhoneNumber;
    console.log(body);
    this.api.PostUpdateSaleDetails(body, this.isEdit).subscribe((res: string) => console.log(res));
  }
}
