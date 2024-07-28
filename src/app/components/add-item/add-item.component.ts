import { Component, Inject, Input } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SelectUnitComponent } from '../select-unit/select-unit.component';
import { DataService } from 'src/app/services/data.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import { AddItemCategoryComponent } from '../add-item-category/add-item-category.component';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent {
  selectedTab: string = 'pricing' ;
  showSelectUnit = false;
  isWholesalePriceEnabled: boolean = true;
  // form data
  itemName: any = '';
  itemHsn: any = '';
  itemCode: any = '';
  category: any = '';
  salePrice: number;
  saleWithOrWithoutTax: any = 'Without Tax';
  discountOnSalePrice: number;
  percentageOrAmount: any = 'Percentage';
  wholeSalePrice: number;
  wholeSaleWithOrWithoutTax: any = 'Without Tax';
  minimumWholeSaleQuantity: number;
  purchasePrice: number;
  purchaseWithOrWithoutTax: any = 'Without Tax';
  taxRate: any = 'None';
  openingQuantity: number;
  atPrice: number;
  asOfDate: any = '';
  minimumStockToMaintain: number;
  _location: any = '';
  //------------
  typeOfPay: any ='';
  remainigQuantity: any ='';

  isSaveAndNew: boolean = false;

  addItemForm: UntypedFormGroup;

  @Input() itemDetails: any;

  categoryList: any;

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService, private api: ApiService) {}

  ngOnInit() {
    this.categoryList = this.dataService.categoryListResponse.map((getCateogoryList: { category: any; }) => getCateogoryList.category);
    console.log("ITEM: ", this.categoryList)
    // if (!this.dataService.isItemUpdate){
    //   this.category = 'GENERAL'
    // }
    this.addItemForm = new UntypedFormGroup({
      itemNameControl: new UntypedFormControl('',),
      itemHsnControl: new UntypedFormControl('',),
      categoryControl: new UntypedFormControl('GENERAL',),
      itemCodeControl: new UntypedFormControl('',),
      salePriceControl: new UntypedFormControl('',),
      saleWithOrWithoutTaxControl: new UntypedFormControl('',),
      discountOnSalePriceControl: new UntypedFormControl('',),
      percentageOrAmountControl: new UntypedFormControl('',),
      wholeSalePriceControl: new UntypedFormControl('',),
      wholeSaleWithOrWithoutTaxControl: new UntypedFormControl('',),
      minimumWholeSaleQuantityControl: new UntypedFormControl('',),
      purchasePriceControl: new UntypedFormControl('',),
      purchaseWithOrWithoutTaxControl: new UntypedFormControl('',),
      taxRateControl: new UntypedFormControl('',),
      openingQuantityControl: new UntypedFormControl('',),
      atPriceControl: new UntypedFormControl('',),
      asOfDateControl: new UntypedFormControl('',),
      minimumStockToMaintainControl: new UntypedFormControl('',),
      _locationControl: new UntypedFormControl('',),
    })
    if(!this.dataService.isItemUpdate){
      this.category = 'GENERAL'
    }

    if(this.data.status='SUCCESS'){
      this.populateForm(this.data.itemDetails) 
    }
  }

  populateForm(itemDetails: any) {
    if (itemDetails) {
      this.itemName = this.data.itemName
      // this.typeOfPay= itemDetails.gst
      this.itemHsn= itemDetails.itemhsn
      // this.baseUnit= itemDetails.partygroup
      // this.secondaryunit= itemDetails.gsttype
      // this.conversionrates= itemDetails._state
      this.category= itemDetails.category
      this.itemCode= itemDetails.itemcode
      this.salePrice= itemDetails.saleprice
      this.saleWithOrWithoutTax= itemDetails.salewithorwithouttax
      this.discountOnSalePrice= itemDetails.discountonsaleprice
      this.wholeSalePrice= itemDetails.wholesaleprice
      this.wholeSaleWithOrWithoutTax= itemDetails.wholesalewithorwithouttax
      this.minimumWholeSaleQuantity= itemDetails.minimumwholesalequantity
      this.purchasePrice= itemDetails.purchaseprice
      this.purchaseWithOrWithoutTax= itemDetails.purchasewithorwithouttax
      this.taxRate= itemDetails.taxrate
      this.openingQuantity= itemDetails.openingquantity
      this.remainigQuantity= itemDetails.openingquantity
      this.atPrice= itemDetails.atprice
      this.asOfDate= itemDetails.asofdate
      this.minimumStockToMaintain= itemDetails.minimumstocktomaintain
      this._location= itemDetails._location
      this.percentageOrAmount= itemDetails.percentageoramounttype
  }
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // showSelectUnitModal() {
  //   this.showSelectUnit = !this.showSelectUnit;
  // }

  toggleWholesalePrice() {
    // debugger;
    this.isWholesalePriceEnabled = !this.isWholesalePriceEnabled;
  }

  openSelectUnitModal() {
    // debugger;
    const dialogRef = this.dialog.open(SelectUnitComponent, {
      width: '40%',
      // height: '35%', 
      // Adjust the width as needed
      // Other configuration options (e.g., height, data) can be added here
    });
  
    // Optionally, handle the result from the modal dialog
    dialogRef.afterClosed().subscribe(result => {
      // Handle the result here if needed
    });
  }

  submit(isSaveAndNew: boolean) {
    // debugger;
    if(this.addItemForm.valid) {

    this.AddItemData(this.addItemForm.value);
    if(isSaveAndNew){
      this.addItemForm.reset();
    }
  } else {
      Swal.fire({
        title: 'Validation Error!',
        text: 'One or more validation error has occured. Please fill all the required fields.',
        confirmButtonText: 'OK',
      })
  }
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddItemData(body: any): Promise<void> {
    // debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        typeOfPay: this.typeOfPay,
        registeredPhoneNumber: 9920279905,
        itemName: this.itemName,
        itemHsn: this.itemHsn,
        baseunit: this.dataService.selectedOption1, 
        secondaryunit: this.dataService.selectedOption2,
        conversionrates: this.dataService.conversionRate,
        category: this.category,
        itemCode: this.itemCode,
        salePrice: this.salePrice,
        saleWithOrWithoutTax: this.saleWithOrWithoutTax,
        discountOnSalePrice: this.discountOnSalePrice,
        percentageOrAmountType: this.percentageOrAmount,
        wholeSalePrice: this.wholeSalePrice,
        wholeSaleWithOrWithoutTax: this.wholeSaleWithOrWithoutTax,
        minimumWholeSaleQuantity: this.minimumWholeSaleQuantity,
        purchasePrice: this.purchasePrice,
        purchaseWithOrWithoutTax:this.purchaseWithOrWithoutTax,
        taxRate: this.taxRate,
        openingQuantity: this.openingQuantity,
        // remainingQunatity: this.remainingQunatity,
        atPrice: this.atPrice,
        asOfDate: this.asOfDate,
        minimumStockToMaintain: this.minimumStockToMaintain,
        _location: this._location,
      }
      // if(this.dataService.isItemUpdate){
      //   body.oldPartyName = this.dataService.oldPartyName
      // }
      this.api.AddItemDetails(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res == "Success") {
          console.log("Success")
        }
        else{
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  openAddItemCategoryModal() {
    const dialogRef = this.dialog.open(AddItemCategoryComponent, {
      width: '40%',
      height: '35%', 
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  get itemNameControl() { return this.addItemForm.get('itemNameControl')}
  get itemHsnControl() { return this.addItemForm.get('itemHsnControl')}
  get categoryControl() { return this.addItemForm.get('categoryControl')}
  get itemCodeControl() { return this.addItemForm.get('itemCodeControl')}
  get salePriceControl() { return this.addItemForm.get('salePriceControl')}
  get saleWithOrWithoutTaxControl() { return this.addItemForm.get('saleWithOrWithoutTaxControl')}
  get discountOnSalePriceControl() { return this.addItemForm.get('discountOnSalePriceControl')}
  get percentageOrAmountControl() { return this.addItemForm.get('percentageOrAmountControl')}
  get wholeSalePriceControl() { return this.addItemForm.get('wholeSalePriceControl')}
  get wholeSaleWithOrWithoutTaxControl() { return this.addItemForm.get('wholeSaleWithOrWithoutTaxControl')}
  get minimumWholeSaleQuantityControl() { return this.addItemForm.get('minimumWholeSaleQuantityControl')}
  get purchasePriceControl() { return this.addItemForm.get('purchasePriceControl')}
  get purchaseWithOrWithoutTaxControl() { return this.addItemForm.get('purchaseWithOrWithoutTaxControl')}
  get taxRateControl() { return this.addItemForm.get('taxRateControl')}
  get openingQuantityControl() { return this.addItemForm.get('openingQuantityControl')}
  get atPriceControl() { return this.addItemForm.get('atPriceControl')}
  get asOfDateControl() { return this.addItemForm.get('asOfDateControl')}
  get minimumStockToMaintainControl() { return this.addItemForm.get('minimumStockToMaintainControl')}
  get _locationControl() { return this.addItemForm.get('_locationControl')}
}
