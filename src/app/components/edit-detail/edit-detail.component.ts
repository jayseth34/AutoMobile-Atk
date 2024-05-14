import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PartyListRs, TransactionDetails, TransactionTypeEnum, ItemDetail, Item, ItemListRs } from 'src/app/models';
import { STATE_LIST } from 'src/app/dummyData';
import { Party } from 'src/app/models';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/api.service';
import { distinctUntilChanged, pairwise, startWith } from 'rxjs';


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

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(localStorage.getItem("phonenumber") ?? "");
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
          this.modifyDetail.get("billingAddress")?.disable();
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

  public get itemDetailValue(): FormArray {
    return (this.itemDataForm.get("items") as FormArray);
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
      "unit": new FormControl({ value: data?.unit ?? this.UNITS[0], disabled: true }),
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
    return element;
  }

  addNewFormRow(row: FormGroup) {
    let control = this.itemDataForm.get("items") as FormArray;
    control.push(row);
  }

  handleDeleteRowClick(ind: number) {
    console.log(`Deleting: ${ind}`);
    this.itemDetailValue.removeAt(ind);
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
    console.log("New Item Base unit: ", newItem.baseunit);
    this.items.splice(ind, 1);

    // Adding the previous (old) item to the items list
    const arr: Item[] = JSON.parse(localStorage.getItem("itemList") ?? "")
    let prevItem = arr.find((item: Item) => item.itemname === prev);
    if (prevItem)
      this.items.push(prevItem);

    // if()
    // Updating the row containing the new element
    element.patchValue({
      "qty": 1,
      "item": next,
      "unit": newItem.baseunit ?? "None",
      "price": newItem.saleprice ?? 0,
      "discountPercent": 0.0,
      "discountAmount": 0.0,
      "taxPercent": 0.0,
      "taxAmount": 0.0,
      "totalAmount": 0.0,
    });
  }

  compareItems(item1: Item, item2: Item) {
    console.log("Called");
    return item1.itemname === item2.itemname;
  }

  handleItemChangeRow(formControl: any) {

  }
}
