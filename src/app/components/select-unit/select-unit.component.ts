import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-select-unit',
  templateUrl: './select-unit.component.html',
  styleUrls: ['./select-unit.component.css']
})
export class SelectUnitComponent {

  base_unit: any = 'QUINTAL (Qtl)';
  secondary_unit: any = 'PAIRS'
  showConversion: boolean = false;
  selectUnitForm: FormGroup;
  @Input() selectunit: any;
  
  // Keep existing short codes (KG/G) for backward compatibility, and add the full Vyapar-like unit set.
  private readonly unitOptions = [
    { label: 'None', value: '' },
    { label: 'BAGS (Bag)', value: 'BAGS (Bag)' },
    { label: 'BOTTLES (Btl)', value: 'BOTTLES (Btl)' },
    { label: 'BOX (Box)', value: 'BOX (Box)' },
    { label: 'BUNDLES (Bdl)', value: 'BUNDLES (Bdl)' },
    { label: 'CANS (Can)', value: 'CANS (Can)' },
    { label: 'CARTONS (Ctn)', value: 'CARTONS (Ctn)' },
    { label: 'DOZENS (Dzn)', value: 'DOZENS (Dzn)' },
    { label: 'GRAMS (g)', value: 'GRAMS (g)' },
    { label: 'KILOGRAMS (Kg)', value: 'KILOGRAMS (Kg)' },
    { label: 'LITRE (Ltr)', value: 'LITRE (Ltr)' },
    { label: 'METER (mtr)', value: 'METER (mtr)' },
    { label: 'MILLILITRE (Ml)', value: 'MILLILITRE (Ml)' },
    { label: 'NUMBERS (Nos)', value: 'NUMBERS (Nos)' },
    { label: 'PACKS (Pac)', value: 'PACKS (Pac)' },
    { label: 'QUINTAL (Qtl)', value: 'QUINTAL (Qtl)' },
    { label: 'PAIRS', value: 'PAIRS' },
    { label: 'KG', value: 'KG' },
    { label: 'G', value: 'G' },
  ];

  options1 = this.unitOptions;
  options2 = this.unitOptions;

  constructor(public dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<SelectUnitComponent>) { }

  ngOnInit(){
    this.selectUnitForm = new FormGroup({
      selectedOption1: new FormControl(this.data.baseunit || '',),
      selectedOption2: new FormControl(this.data.secondaryunit || '',),
      conversionRate: new FormControl(this.data.conversionrates || 0, Validators.pattern("^[0-9]*$")),
    });

    this.selectUnitForm.get('selectedOption1')?.valueChanges.subscribe(() => this.unitConversion());
    this.selectUnitForm.get('selectedOption2')?.valueChanges.subscribe(() => this.unitConversion());
    console.log("SELECT UNIT", this.selectUnitForm)
    if(this.data.status === 'SUCCESS'){
      this.populateForm(this.data.baseunit, this.data.secondaryunit,this.data.conversionrates) 
    }
  }

  unitConversion() {
    const option1 = this.selectUnitForm.get('selectedOption1')?.value;
    const option2 = this.selectUnitForm.get('selectedOption2')?.value;
    this.showConversion = !!(option1 && option2);
  }

  save() {
    const selectedOption1 = this.selectUnitForm.get('selectedOption1')?.value;
  const selectedOption2 = this.selectUnitForm.get('selectedOption2')?.value;
  const conversionRate = this.selectUnitForm.get('conversionRate')?.value;

  // Save data in the data service
  this.dataService.setSelectedOption1(selectedOption1);
  this.dataService.setSelectedOption2(selectedOption2);
  this.dataService.setConversionRate(conversionRate);

  // Pass data back to the parent component and close the dialog
  this.dialogRef.close({
    baseunit: selectedOption1,
    secondaryunit: selectedOption2,
    conversionrates: conversionRate
  });
  }

  populateForm(baseunit: any, secondaryunit: any, conversionrates: any){
    this.selectUnitForm.patchValue({
      selectedOption1: baseunit,
      selectedOption2: secondaryunit,
      conversionRate: conversionrates 
    })
  }

  get selectedOption1() { return this.selectUnitForm.get('selectedOption1')}
  get selectedOption2() { return this.selectUnitForm.get('selectedOption2')}
  get conversionRate() { return this.selectUnitForm.get('conversionRate')}

}
