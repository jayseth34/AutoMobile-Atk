import { Component } from '@angular/core';

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
  
  options1 = [
    { label: 'KG', value: '1A' },
    { label: 'G', value: '1B' }
  ];

  options2 = [
    { label: 'KG ', value: '2A' },
    { label: 'G', value: '2B' }
  ];

  constructor() { }

  unitConversion(){
    debugger;
    if (this.selectedOption2){
      this.showConversion = true;
    } else {
      this.showConversion = false;
    }
  }

}
