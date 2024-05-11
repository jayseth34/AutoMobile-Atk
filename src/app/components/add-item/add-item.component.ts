import { Component } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SelectUnitComponent } from '../select-unit/select-unit.component';

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
  salePrice: any = '';
  saleWithOrWithoutTax: any = '';
  discountOnSalePrice: any = '';
  percentageOrAmount: any = '';
  wholeSalePrice: any = '';
  wholeSaleWithOrWithoutTax: any = '';
  minimumWholeSaleQuantity: any = '';
  purchasePrice: any = '';
  purchaseWithOrWithoutTax: any = '';
  taxRate: any = '';
  openingQuantity: any = '';
  atPrice: any = '';
  asOfDate: any = '';
  minimumStockToMaintain: any = '';
  _location: any = '';

  addItemForm: UntypedFormGroup;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {

    this.addItemForm = new UntypedFormGroup({
      itemNameControl: new UntypedFormControl('',),
      itemHsnControl: new UntypedFormControl('',),
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

    this.selectTab('pricing')
    console.log("working")
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // showSelectUnitModal() {
  //   this.showSelectUnit = !this.showSelectUnit;
  // }

  toggleWholesalePrice() {
    debugger;
    this.isWholesalePriceEnabled = !this.isWholesalePriceEnabled;
  }

  openSelectUnitModal() {
    debugger;
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

  submit(){
    console.log('ADD ITEM FORM: ', this.addItemForm.value)
    console.log('ADD ITEM FORM: ', this.itemName)

  }

  get itemNameControl() { return this.addItemForm.get('itemNameControl')}
  get itemHsnControl() { return this.addItemForm.get('itemHsnControl')}
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
