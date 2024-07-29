import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-select-unit',
  templateUrl: './select-unit.component.html',
  styleUrls: ['./select-unit.component.css']
})
export class SelectUnitComponent {

  selectedOption1: any = null;
  selectedOption2: any = null;
  base_unit: any = 'QUINTAL (Qtl)';
  secondary_unit: any = 'PAIRS'
  showConversion: boolean = false;
  selectUnitForm: FormGroup;
  @Input() selectunit: any;
  
  options1 = [
    { label: 'KG', value: 'KG' },
    { label: 'G', value: 'G' }
  ];

  options2 = [
    { label: 'KG ', value: 'KG' },
    { label: 'G', value: 'G' }
  ];

  constructor(public dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(){
    this.selectUnitForm = new FormGroup({
      selectedOption1: new FormControl('',),
      selectedOption2: new FormControl('',),
      conversionRate: new FormControl(0,Validators.pattern("^[0-9]*$")),
    });
    console.log("SELECT UNIT", this.selectUnitForm)
    if(this.data.status='SUCCESS'){
      this.populateForm(this.data.baseunit, this.data.secondaryunit,this.data.conversionrates) 
    }
  }

  unitConversion(){
    if (this.selectUnitForm.get('selectedOption1')?.value && this.selectUnitForm.get('selectedOption2')?.value){
      this.showConversion = true;
    } else {
      this.showConversion = false;
    }
  }

  save() {
    this.dataService.setSelectedOption1(this.selectUnitForm.get('selectedOption1')?.value);
    this.dataService.setSelectedOption2(this.selectUnitForm.get('selectedOption2')?.value);
    this.dataService.setConversionRate(this.selectUnitForm.get('conversionRate')?.value);
  }

  populateForm(baseunit: any, secondaryunit: any, conversionrates: any){
    this.selectUnitForm.patchValue({
      selectedOption1: baseunit,
      selectedOption2: secondaryunit,
      conversionRate: conversionrates 
    })
  }

}
