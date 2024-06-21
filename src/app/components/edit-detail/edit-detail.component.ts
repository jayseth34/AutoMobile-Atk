import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PartyListRs, TransactionDetails, ItemDetail, Item, ItemListRs, SaveUpdateTransactionRq } from 'src/app/models';
import { STATE_LIST } from 'src/app/dummyData';
import { Party } from 'src/app/models';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { distinctUntilChanged, map, of, pairwise, startWith } from 'rxjs';

type BalanceColors = "green" | "red" | "black";

@Component({
  selector: 'app-edit-detail',
  templateUrl: './edit-detail.component.html',
  styleUrls: ['./edit-detail.component.css']
})
export class EditDetailComponent implements OnInit {
  // TransactionType = TransactionTypeEnum;
  transactionType: string;
  items: Item[] = [];
  selectedParty?: Party;
  currentInvNo?: number;
  stateList?: string[];
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

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder) { }

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
    this.modifyDetail = new FormGroup({
      customername: new FormControl("", [Validators.required, Validators.minLength(1)]),
      phonenumber: new FormControl("", [Validators.required, Validators.minLength(9), Validators.maxLength(10)]),
      billingaddress: new FormControl("", [Validators.required, Validators.minLength(1)]),
      shippingaddress: new FormControl("", [Validators.required, Validators.minLength(1)]),
      invoicedate: new FormControl({ value: new Date(), disabled: true }),
      stateofsupply: new FormControl({ value: "Maharashtra", disabled: true }),
      partybalance: new FormControl(0),
      invoicenumber: new FormControl({ value: this.currentInvNo, disabled: true }),
      paymenttype: new FormControl("Cash"),
      paymentstatus: new FormControl("UNPAID"),
      fullpayment: new FormControl<boolean>(true),
      received: new FormControl({ value: 0, disabled: false }),
      itemdetailslist: new FormArray([]),
    });

    this.modifyDetail.get("fullpayment")?.valueChanges.subscribe((val: any) => this.updatePayAmount(val));

    this.modifyDetail.get("partybalance")?.disable();

    this.route.paramMap.subscribe((params: ParamMap) => {
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
        this.api.getTransactionDetails(this.registeredPhoneNumber, this.invNo, "Sale", this.isSaleConvert, this.isSaleOrderConvert)
          .subscribe((transaction: TransactionDetails) => {
            this.modifyDetail.patchValue({
              customername: transaction.customername,
              phonenumber: transaction.phonenumber,
              billingaddress: transaction.billingaddress,
              invoicedate: new Date(transaction.invoicedate),
              state: transaction.stateofsupply,
              invoicenumber: this.invNo,
              paymenttype: transaction.paymenttype
            });

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
    if (data != null) {
      finalAmount = data?.priceperunit * data.qty + 0 - 0;
      this.totalAmount += finalAmount;
      this.totalQuantity += data.qty;
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

    this.updatePayAmount(true);

    // Setting the substriber to get previous and next value
    // Using pairwise to club two changes together.
    // writing startWith() to specify the first change

    // using distinctUntilChanged because the function get called two times
    // Error can be two subscriptions but I don't know ??
    element.get("item")?.valueChanges.pipe(distinctUntilChanged(), startWith(data?.item ?? ""), pairwise()).subscribe(([prev, next]: [any, any]) => this.handleItemChange(prev, next, element));
    const valueChanges$ = element.valueChanges.pipe(map((item: any) => this.getChangesNew(element)));
    valueChanges$.subscribe((changeObj: any) => {
      console.log("Changed", changeObj);
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
            const iscountAmtQty = ((discountPer * pricePerUnit) / 100) * changeObj[key]
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

    this.modifyDetail.get("received")?.setValue(this.totalAmount);
  }

  updatePayAmount(val: boolean) {
    const control = this.modifyDetail.get("received");
    if (!val) {
      control?.enable();
      control?.setValue(0);
      this.modifyDetail.get("paymentstatus")?.setValue("UNPAID");
    } else {
      control?.disable();
      control?.setValue(this.totalAmount);
      this.modifyDetail.get("paymentstatus")?.setValue("PAID");
    }
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
    (this.modifyDetail.get("itemdetailslist") as FormArray).at(ind).disable();
    // this.itemDetailValue?.at(ind).disable()
    // this.itemDetailValue.removeAt(ind);
    element.patchValue({
      queryoperationtype: "DELETE",
    });
    this.handleItemChangeRow(element);
    this.updateTransactionData();
  }

  handleAddRowClick() {
    this.addNewFormRow(this.createNewFormRow(null));
    this.updateTransactionData();
  }

  handleCustomerInputClick() {
    // api call
    // Getting the parties data
    if (this.partyList == null || this.partyList == undefined) {
      this.api.getPartyList(this.registeredPhoneNumber).subscribe((res: PartyListRs) => {
        this.partyList = res.getPartyList;
      });
    }
  }

  handleStateInputClick() {
    this.stateList = STATE_LIST
  }

  handleChange(ev: any) {
    let selectedCustomerName = ev.option.value;
    this.selectedParty = this.partyList.find((party: Party) => party.partyname === selectedCustomerName);
    if (this.selectedParty != undefined) {
      let balance = this.selectedParty.toreceivefromparty - this.selectedParty.topayparty;
      this.modifyDetail.patchValue({
        phonenumber: this.selectedParty.phonenumber,
        billingaddress: this.selectedParty.billingaddress,
        shippingaddress: this.selectedParty.shipppingaddress,
        partybalance: balance,
      });
      if (balance < 0)
        this.balanceColor = "red";
      else if (balance > 0)
        this.balanceColor = "green";
      else
        this.balanceColor = "black";
    }
  }

  getItems() {
    if (this.items == undefined || this.items.length == 0) {
      const itemNameList = this.itemDetailValue.map(item => item.get("item")?.value);
      this.api.getItemList(this.registeredPhoneNumber).subscribe((res: ItemListRs) => {
        localStorage.setItem("itemList", JSON.stringify(res.getItemList));
        res.getItemList.forEach(item => {
          if (!itemNameList.includes(item.itemname)) {
            this.items.push(item);
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
    console.log(`Called with parameters: ${prev} and ${next}`);
    // Removing the next(new) value from the items array
    const ind = this.items.findIndex((item: Item) => item.itemname === next)
    const newItem: Item = this.items[ind];
    this.items.splice(ind, 1);

    // Adding the previous (old) item to the items list
    const arr: Item[] = JSON.parse(localStorage.getItem("itemList") ?? "")
    let prevItem = arr.find((item: Item) => item.itemname === prev);
    if (prevItem)
      this.items.push(prevItem);

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
      const discountPercent = ((item?.discountonsaleprice ?? 0) / (item?.saleprice ?? 0)) * 100;

      this.totalAmount += itemTotalAmt;
      this.totalDiscount += item.discountonsaleprice;
      this.totalQuantity += 1;
      element.patchValue({
        "qty": 1,
        "item": item.itemname,
        "unit": item.baseunit ?? "None",
        "priceperunit": item.saleprice ?? 0,
        "discountPercent": discountPercent,
        "discountAmount": item.discountonsaleprice,
        "taxPercent": 0.0,
        "taxAmount": 0.0,
        "totalAmount": itemTotalAmt
      }, { emitEvent: false });
    }
  }

  submitDetails() {
    // this.itemDetailValue.forEach((item) => {
    //   let changed = item.get("remainingquantity")?.value - (item.get("qty")?.value - item.get("initialCount")?.value);
    //   item.patchValue({
    //     "remainingquantity": changed
    //   }, { emitEvent: false });
    // });
    let body: SaveUpdateTransactionRq = this.modifyDetail.getRawValue();
    if (body.received === this.totalAmount) {
      body.paymentstatus = "PAID";
    }

    let diff = this.totalAmount - body.received;
    body.isconvert = this.isSaleConvert;
    body.isupdate = true;
    body.total = this.totalAmount;
    body.registeredphonenumber = this.registeredPhoneNumber;
    // body.balance = body.total - body.received;
    body.topayparty = diff < 0 ? diff : 0;
    body.toreceivefromparty = diff > 0 ? diff : 0;
    body.typeofpay = this.transactionType;
    body.itemdetailslist = body.itemdetailslist.filter((val) => val.item.length > 0);
    console.log(body);
    this.api.PostUpdateSaleDetails(body, this.isEdit).subscribe((res: string) => console.log(res));
  }

  updateShippingAddress() {
    this.shippingAddressSame = !this.shippingAddressSame;
    if (this.shippingAddressSame)
      this.modifyDetail.get("shippingaddress")?.setValue(this.modifyDetail.get("billingaddress")?.value);
    else
      this.modifyDetail.get("shippingaddress")?.setValue("");
  }
}
