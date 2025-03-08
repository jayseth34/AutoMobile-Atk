import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectUnitComponent } from '../select-unit/select-unit.component';
import { DataService } from 'src/app/services/data.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import { AddItemCategoryComponent } from '../add-item-category/add-item-category.component';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';

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

  addItemForm: FormGroup;

  @Input() itemDetails: any;

  categoryList: any;
  registeredPhoneNmber:any;
  remainingquant: number;
  initialopeningquant: number;

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService, private api: ApiService, public cs: CommonService, public dialogRef: MatDialogRef<AddItemComponent>, public cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.registeredPhoneNmber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.initializeForm()
    this.cdr.detectChanges();
    this.categorygroup()
    console.log("ITEM: ", this.categoryList)

    if(this.data.status='SUCCESS'){
      this.populateForm(this.data.itemDetails)
      if(this.data.itemDetails.wholesaleprice > 0 || this.data.itemDetails.minimumwholesalequantity > 0){
        this.isWholesalePriceEnabled = false
      } 
    }
  }

  assignCode(){
    let body = {
      registeredphonenumber: this.registeredPhoneNmber
    }
    this.api.assignCode(body).subscribe((response:any) =>{
      if(response.status=='SUCCESS'){
        if(!this.cs.isUndefineOrNull(response.assignedcode)){
          this.addItemForm.get('itemCodeControl')?.setValue(response.assignedcode); 
        }
      }
    })
  }

  categorygroup(){
    this.api.GetCategory(this.registeredPhoneNmber).subscribe((response:any) => {
      if(response.status == "SUCCESS") {
        this.categoryList = response.getCateogoryList
        console.log("GET CATEGORY SUCCESS", response)
      }
      else{
        console.log("CATEGORY FAILED")
      }
    })
  }

  initializeForm() {
    const defaultDate = moment().format('YYYY-MM-DD');
    this.addItemForm = new FormGroup({
      itemNameControl: new FormControl(this.data.itemName || '', Validators.required),
      itemHsnControl: new FormControl(this.data.itemDetails?.itemhsn || ''),
      categoryControl: new FormControl(this.data.itemDetails?.category || 'GENERAL'),
      itemCodeControl: new FormControl(this.data.itemDetails?.itemcode || ''),
      salePriceControl: new FormControl(this.data.itemDetails?.saleprice || 0, Validators.pattern('^[0-9]*$')),
      saleWithOrWithoutTaxControl: new FormControl(this.data.itemDetails?.salewithorwithouttax || 'Without Tax'),
      discountOnSalePriceControl: new FormControl(this.data.itemDetails?.discountonsaleprice || 0, Validators.pattern('^[0-9]*$')),
      percentageOrAmountControl: new FormControl(this.data.itemDetails?.percentageoramounttype || 'Percentage'),
      wholeSalePriceControl: new FormControl(this.data.itemDetails?.wholesaleprice || 0, Validators.pattern('^[0-9]*$')),
      wholeSaleWithOrWithoutTaxControl: new FormControl(this.data.itemDetails?.wholesalewithorwithouttax || 'Without Tax'),
      minimumWholeSaleQuantityControl: new FormControl(this.data.itemDetails?.minimumwholesalequantity || 0, Validators.pattern('^[0-9]*$')),
      purchasePriceControl: new FormControl(this.data.itemDetails?.purchaseprice || 0, Validators.pattern('^[0-9]*$')),
      purchaseWithOrWithoutTaxControl: new FormControl(this.data.itemDetails?.purchasewithorwithouttax || 'Without Tax'),
      taxRateControl: new FormControl(this.data.itemDetails?.taxrate || 'None'),
      openingQuantityControl: new FormControl(this.data.itemDetails?.openingquantity || 0, Validators.pattern('^[0-9]*$')),
      atPriceControl: new FormControl(this.data.itemDetails?.atprice || 0, Validators.pattern('^[0-9]*$')),
      asOfDateControl: new FormControl(this.data.itemDetails?.asofdate  ? moment(this.data.itemDetails?.asofdate).format('YYYY-MM-DD')
      : defaultDate),
      minimumStockToMaintainControl: new FormControl(this.data.itemDetails?.minimumstocktomaintain || 0, Validators.pattern('^[0-9]*$')),
      _locationControl: new FormControl(this.data.itemDetails?._location || ''),
      baseunit: new FormControl(this.data.itemDetails?.baseunit || ''),
      secondaryunit: new FormControl(this.data.itemDetails?.secondaryunit || ''),
      conversionrates: new FormControl(this.data.itemDetails?.conversionrates || 0, Validators.pattern('^[0-9]*$')),
      mrpControl: new FormControl(this.data.itemDetails?.mrp || 0, Validators.pattern('^[0-9]*$')),
    });
  }

  populateForm(itemDetails: any) {
    this.remainingquant = itemDetails.remainingquantity;
      this.addItemForm.patchValue({
        itemNameControl: this.data.itemName,
        itemHsnControl: itemDetails.itemhsn,
        categoryControl: itemDetails.category,
        itemCodeControl: itemDetails.itemcode,
        salePriceControl: itemDetails.saleprice,
        saleWithOrWithoutTaxControl: this.cs.isUndefineOrNull(itemDetails.salewithorwithouttax)? 'Without Tax' : itemDetails.salewithorwithouttax,
        discountOnSalePriceControl: itemDetails.discountonsaleprice,
        percentageOrAmountControl: this.cs.isUndefineOrNull(itemDetails.percentageoramounttype)? 'Percentage' : itemDetails.percentageoramounttype,
        wholeSalePriceControl: itemDetails.wholesaleprice,
        wholeSaleWithOrWithoutTaxControl: this.cs.isUndefineOrNull(itemDetails.wholesalewithorwithouttax) ? 'Without Tax' : itemDetails.wholesalewithorwithouttax,
        minimumWholeSaleQuantityControl: itemDetails.minimumwholesalequantity,
        purchasePriceControl: itemDetails.purchaseprice,
        purchaseWithOrWithoutTaxControl: this.cs.isUndefineOrNull(itemDetails.purchasewithorwithouttax)? 'Without Tax' : itemDetails.purchasewithorwithouttax,
        taxRateControl: itemDetails.taxrate,
        openingQuantityControl: itemDetails.openingquantity,
        atPriceControl: itemDetails.atprice,
        asOfDateControl: itemDetails.asofdate ? moment(itemDetails.asofdate).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD'),
        minimumStockToMaintainControl: itemDetails.minimumstocktomaintain,
        _locationControl: itemDetails._location,
        typeOfPayControl: itemDetails.typeOfPay,
        remainingQuantityControl: itemDetails.remainingquantity,
        baseunit: itemDetails.baseunit,
        secondaryunit: itemDetails.secondaryunit,
        conversionrates: itemDetails.conversionrates,
        mrp: itemDetails.mrp
      });
      this.initialopeningquant = itemDetails.openingquantity;
      
  }

  selectTabIndex(index: number) {
    if (index === 0) {
      this.selectedTab = 'pricing';
    } else if (index === 1) {
      this.selectedTab = 'stock';
    }
  }

  toggleWholesalePrice() {
    this.isWholesalePriceEnabled = !this.isWholesalePriceEnabled;
  }

  openSelectUnitModal() {
    const dialogRef = this.dialog.open(SelectUnitComponent, {
      width: '40%',
      data : {baseunit : this.addItemForm.get('baseunit')?.value, secondaryunit : this.addItemForm.get('secondaryunit')?.value,
        conversionrates : this.addItemForm.get('conversionrates')?.value, status: "SUCCESS"
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.updateValues(result)
    });
  }

  updateValues(result: any) {
    this.addItemForm.patchValue({
        baseunit: result.baseunit,
        secondaryunit: result.secondaryunit,
        conversionrates: result.conversionrates,
    })
  }

  submit(isSaveAndNew: boolean) {
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
    console.log("BEFore return");
    if(this.dataService.isItemUpdate){
      var val = this.initialopeningquant - this.addItemForm.value.openingQuantityControl
      this.remainingquant = this.remainingquant - val
    }
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        typeOfPay: this.typeOfPay,
        registeredPhoneNumber: this.registeredPhoneNmber,
        itemName: this.addItemForm.value.itemNameControl,
        itemHsn: this.addItemForm.value.itemHsnControl,
        baseunit: this.addItemForm.value.baseunit,
        secondaryunit: this.addItemForm.value.secondaryunit,
        conversionrates: this.addItemForm.value.conversionrates,
        category: this.addItemForm.value.categoryControl,
        itemCode: String(this.addItemForm.value.itemCodeControl),
        salePrice: this.addItemForm.value.salePriceControl,
        saleWithOrWithoutTax: this.addItemForm.value.saleWithOrWithoutTaxControl,
        discountOnSalePrice: this.addItemForm.value.discountOnSalePriceControl,
        percentageOrAmountType: this.addItemForm.value.percentageOrAmountControl,
        wholeSalePrice: this.addItemForm.value.wholeSalePriceControl,
        wholeSaleWithOrWithoutTax: this.addItemForm.value.wholeSaleWithOrWithoutTaxControl,
        minimumWholeSaleQuantity: this.addItemForm.value.minimumWholeSaleQuantityControl,
        purchasePrice: this.addItemForm.value.purchasePriceControl,
        purchaseWithOrWithoutTax: this.addItemForm.value.purchaseWithOrWithoutTaxControl,
        taxRate: this.addItemForm.value.taxRateControl,
        openingQuantity: this.addItemForm.value.openingQuantityControl,
        remainingQuantity: this.dataService.isItemUpdate? this.remainingquant : this.addItemForm.value.remainingQuantityControl,
        atPrice: this.addItemForm.value.atPriceControl,
        asOfDate: this.addItemForm.value.asOfDateControl,
        minimumStockToMaintain: this.addItemForm.value.minimumStockToMaintainControl,
        _location: this.addItemForm.value._locationControl,
        remainingquantity: this.dataService.isItemUpdate? this.remainingquant : this.addItemForm.value.openingQuantityControl,
        isitemupdate: this.dataService.isItemUpdate,
        olditemname: this.addItemForm.value.itemNameControl,
        mrp: this.addItemForm.value.mrpControl
      }
      if(this.dataService.isItemUpdate){
        body.olditemname = this.dataService.oldItemName
      }
      this.api.AddItemDetails(JSON.stringify(body)).subscribe(res => {
        if (res.status == "Success") {
          Swal.fire({
            text: res.statusmessage,
            allowOutsideClick:false
          }).then(() => {
            this.dataService.isItemUpdate = false;
            this.isWholesalePriceEnabled = true;
            this.dialogRef.close();
          });
        }
        else if (res.status == 'Failed') {
          Swal.fire({
            text: res.statusmessage,
            confirmButtonText: 'OK',
          })
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  openAddItemCategoryModal() {
    this.dataService.isCategoryUpdate = false;
    const dialogRef = this.dialog.open(AddItemCategoryComponent, {
      width: '40%',
      height: '35%', 
    });
    dialogRef.afterClosed().subscribe(result => {
      this.categorygroup()
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
  get mrpControl() { return this.addItemForm.get('mrpControl')}
}

