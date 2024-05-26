import { AbstractType, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PartyListRs, TransactionDetails, TransactionTypeEnum, ItemDetail, Item, ItemListRs } from 'src/app/models';
import { STATE_LIST } from 'src/app/dummyData';
import { Party } from 'src/app/models';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { Observable, distinctUntilChanged, map, of, pairwise, startWith } from 'rxjs';


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
  totalTax: number = 0
  totalAmount: number = 0

  // For Item Table
  itemDataForm: FormGroup;
  modifyDetail: FormGroup;
  newTransactionData = new MatTableDataSource<any>();
  newTransactionDataHeaders = ["Id", "Item", "Quantity", "Unit", "Price/unit", "Discount", "Tax", "Amount"];
  newTransactionDataColumns = ["id", "item", "quantity", "unit", "price", "discountPercent", "discountAmount", "taxPercent", "taxAmount", "totalAmount"];

  UNITS = [
    "None",
    "pac",
    "PCS",
    "Kg"
  ]

  public get itemDetailValue(): FormArray {
    return (this.itemDataForm.get("items") as FormArray);
  }


  getItemName(item: Item): string {
    return item.itemname
  }


  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") ?? ""));
    this.currentInvNo = parseInt(localStorage.getItem("curInvCount") ?? "");
    this.modifyDetail = new FormGroup({
      partyName: new FormControl(),
      phoneNumber: new FormControl(),
      billingAddress: new FormControl(""),
      shippingAddress: new FormControl(""),
      invoiceDate: new FormControl({ value: new Date(), disabled: true }),
      creditLimit: new FormControl(),
      state: new FormControl({ value: "Maharashtra", disabled: true }),
      partybalance: new FormControl(),
      invNumber: new FormControl({ value: this.currentInvNo, disabled: true }),
    });

    this.modifyDetail.get("partybalance")?.disable();
    this.modifyDetail.get("creditLimit")?.disable();
    this.itemDataForm = new FormGroup({
      items: new FormArray([]),
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has("type")) {
        this.transactionType = params.get("type") as string;
        if (this.transactionType == "Sale") {
          this.modifyDetail.get("phoneNumber")?.disable();
          this.modifyDetail.get("state")?.disable();
        }
      }
      else {
        // Route them back
        this.router.navigateByUrl("Sale/sale-invoice");
      }


      if (params.has("invoiceNo")) {
        this.isEdit = true;
        this.modifyDetail.get("partyName")?.disable();
        this.invNo = parseInt(params.get("invoiceNo") ?? "");
        this.api.getTransactionDetails(this.registeredPhoneNumber, this.invNo, "Sale", this.isSaleConvert, this.isSaleOrderConvert)
          .subscribe((transaction: TransactionDetails) => {
            this.modifyDetail.patchValue({
              "partyName": transaction.customername,
              "phoneNumber": transaction.phonenumber,
              "billingAddress": transaction.billingaddress,
              "invoiceDate": new Date(transaction.invoicedate),
              "state": transaction.stateofsupply,
              "invNumber": this.invNo
            });

            transaction.itemdetailslist.forEach(item => this.addNewFormRow(this.createNewFormRow(item)));
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
    this.newTransactionData.data = this.itemDetailValue.controls;
  }

  createNewFormRow(data: ItemDetail | null): FormGroup {
    console.log("Row creation.");
    let finalAmount = 0
    if (data != null) {
      finalAmount = data?.priceperunit * data.qty + 0 - 0;
      this.totalAmount += finalAmount;
      this.totalQuantity += data.qty;
      console.log(`Final Amount for ${data.item}: ${finalAmount}`);
    }

    let element = new FormGroup({
      // "id": new FormControl(data?.id ?? 0),
      "item": new FormControl(data?.item ?? ""),
      "qty": new FormControl(data?.qty ?? 0),
      "unit": new FormControl({ value: data?.unit ? data?.unit : "None", disabled: true }),
      "price": new FormControl({ value: data?.priceperunit ?? 0.0, disabled: true }),
      "discountPercent": new FormControl(0.0),
      "discountAmount": new FormControl(0.0),
      "taxPercent": new FormControl(0.0),
      "taxAmount": new FormControl(0.0),
      "totalAmount": new FormControl({ value: finalAmount, disabled: true }),
    });

    // Setting the substriber to get previous and next value
    // Using pairwise to club two changes together.
    // writing startWith() to specify the first change

    // using distinctUntilChanged because the function get called two times
    // Error can be two subscriptions but I don't know ??
    element.get("item")?.valueChanges.pipe(distinctUntilChanged(), startWith(data?.item ?? ""), pairwise()).subscribe(([prev, next]: [any, any]) => this.handleItemChange(prev, next, element));
    const valueChanges$ = element.valueChanges.pipe(map((item: any) => this.getChangesNew(element)));
    valueChanges$.subscribe((changeObj: any) => {
      console.log("Changed", changeObj);
      Object.keys(changeObj).forEach((key: string) => {
        const pricePerUnit = element.get("price")?.value as number;
        const discountPer = element.get("discountPercent")?.value as number;
        const discountAmt = element.get("discountAmount")?.value as number;
        const taxPer = element.get("taxPercent")?.value as number;
        const itemQty = element.get("qty")?.value as number;
        const taxAmt = element.get("taxAmount")?.value as number;
        switch (key) {
          case "qty":
            const iscountAmtQty = ((discountPer * pricePerUnit) / 100) * changeObj[key]
            const newTaxAmtQty = ((taxPer * pricePerUnit) / 100) * changeObj[key];
            element.patchValue({
              "discountAmount": iscountAmtQty,
              "taxAmount": newTaxAmtQty,
              "totalAmount": (pricePerUnit * changeObj[key]) - discountAmt + taxAmt
            }, { emitEvent: false });
            break;

          case "discountAmount":
            const newPricePerUnitDisc = changeObj[key] / itemQty;
            element.patchValue({
              "discountPercent": (newPricePerUnitDisc / pricePerUnit) * 100,
              "totalAmount": (pricePerUnit * itemQty) - changeObj[key] + taxAmt
            }, { emitEvent: false });
            break;

          case "discountPercent":
            const newDiscountAmt = (changeObj[key] / 100) * itemQty * pricePerUnit;
            element.patchValue({
              "discountAmount": newDiscountAmt,
              "totalAmount": (pricePerUnit * itemQty) - newDiscountAmt + taxAmt
            }, { emitEvent: false });
            break;

          case "taxAmount":
            const newPricePerUnitTax = changeObj[key] / itemQty;
            element.patchValue({
              "taxPercent": (newPricePerUnitTax / pricePerUnit) * 100,
              "totalAmount": (pricePerUnit * itemQty) + changeObj[key] - discountAmt
            }, { emitEvent: false });
            break;

          case "taxPercent":
            const newTaxAmt = (changeObj[key] / 100) * itemQty * pricePerUnit;
            element.patchValue({
              "taxAmount": newTaxAmt,
              "totalAmount": (pricePerUnit * itemQty) - discountAmt + newTaxAmt
            }, { emitEvent: false });
            break;
        }
        this.calcTotalVal();
      });
    });

    return element;
  }

  calcTotalVal() {
    let tempTotalValObj = {
      "qty": 0,
      "disc": 0,
      "tax": 0,
      "amt": 0
    };
    tempTotalValObj = this.itemDetailValue.controls.reduce((total: any, currVal: any) => {
      total["qty"] += currVal.get("qty").value;
      total["disc"] += currVal.get("discountAmount").value;
      total["tax"] += currVal.get("taxAmount").value;
      total["amt"] += currVal.get("totalAmount").value;
      return total;
    }, tempTotalValObj);
    this.totalAmount = tempTotalValObj.amt;
    this.totalDiscount = tempTotalValObj.disc;
    this.totalQuantity = tempTotalValObj.qty;
    this.totalTax = tempTotalValObj.tax;
  }

  getChanges(item1: Item, item2: Item): [string, any][] {
    console.log(item1, item2);
    let diff$: [string, string | number][];

    if (item1 == null && item2 != null)
      diff$ = Object.entries(item2);
    else if (item1 != null && item2 == null)
      diff$ = Object.entries(item1);
    else if (item1 != null && item2 != null) {
      const result = Object.entries(item1).reduce((acc, [key, value]) => {
        if (item2[key] != value) {
          const updatedAcc = { ...acc, [key]: { "prev": item1[key], "next": item2[key] } };
          return updatedAcc;
        } else {
          return acc;
        }
      }, {});
      diff$ = Object.entries(result);
    }
    else {
      diff$ = [];
    }
    return diff$;
  }

  getChangesNew(item1: FormGroup) {
    const constObj = Object.entries((item1 as FormGroup).controls);
    const changeObj = constObj.reduce((acc: any, currVal: any) => {
      if (currVal[1].dirty) {
        return { ...acc, [currVal[0]]: currVal[1].value };
      }
      return acc;
    }, {});
    item1.markAsPristine();
    return changeObj
  }

  addNewFormRow(row: FormGroup) {
    let control = this.itemDataForm.get("items") as FormArray;
    control.push(row);
  }

  handleDeleteRowClick(ind: number, element: FormControl) {
    this.itemDetailValue.removeAt(ind);
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
      this.modifyDetail.patchValue({
        phoneNumber: this.selectedParty.phonenumber,
        billingAddress: this.selectedParty.billingaddress,
        shippingAddress: this.selectedParty.shipppingaddress,
        creditLimit: this.selectedParty.creditlimit,
        partybalance: this.selectedParty.partybalance,
      });
    }
  }

  getItems() {
    if (this.items == undefined || this.items.length == 0) {
      const itemNameList = this.itemDetailValue.controls.map(item => item.get("item")?.value);
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
    this.totalDiscount -= element.get("discountAmount").value;
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
        "price": item.saleprice ?? 0,
        "discountPercent": discountPercent,
        "discountAmount": item.discountonsaleprice,
        "taxPercent": 0.0,
        "taxAmount": 0.0,
        "totalAmount": itemTotalAmt
      }, { emitEvent: false });
    }
  }

  submitDetails() {
    console.log(this.modifyDetail.getRawValue());
    console.log(this.itemDataForm.getRawValue());
  }

}
