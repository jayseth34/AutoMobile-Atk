import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
  selectUnitForm: UntypedFormGroup;
  
  options1 = [
    { label: 'KG', value: 'KG' },
    { label: 'G', value: 'G' }
  ];

  options2 = [
    { label: 'KG ', value: 'KG' },
    { label: 'G', value: 'G' }
  ];

  constructor(public dataService: DataService) { }

  ngOnInit(){
    this.selectUnitForm = new UntypedFormGroup({
      selectedOption1: new UntypedFormControl('',),
      selectedOption2: new UntypedFormControl('',),
      conversionRate: new UntypedFormControl('',Validators.pattern("^[0-9]*$")),
    });
    console.log("SELECT UNIT", this.selectUnitForm)
  }

  unitConversion(){
    if (this.selectUnitForm.get('selectedOption1')?.value && this.selectUnitForm.get('selectedOption2')?.value){
      this.showConversion = true;
    } else {
      this.showConversion = false;
    }
  }

  save(){
    this.dataService.selectedOption1 = this.selectUnitForm.get('selectedOption1')?.value
    this.dataService.selectedOption2 = this.selectUnitForm.get('selectedOption2')?.value
    this.dataService.conversionRate = this.selectUnitForm.get('conversionRate')?.value
  }

}
