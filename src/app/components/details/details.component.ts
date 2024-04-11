import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { TransactionTypeEnum, TimeFilterEnum } from 'src/app/models';
import { saleData } from 'src/app/dummyData';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  filters = ["All Purchase Invoice", "Current Month", "Last Month", "Current Quarter", "Current Year", "Custom"];
  transactionType: TransactionTypeEnum = TransactionTypeEnum.Sale;
  paidVal: Number = 0;
  unpaidVal: Number = 0;
  totalVal: Number = 0;
  saleData = saleData;

  // For Mat Table
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  displayedColumns: string[] = ['date', 'invoiceNo', 'partyName', 'transactionType', 'paymentType', 'amount', 'balance', 'icons', 'option'];

  // Form Groups
  filterForm = new FormGroup({
    range: new FormControl<TimeFilterEnum>(TimeFilterEnum.CurMonth),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  constructor(private route: Router){

  }

  ngOnInit(): void {
    // console.log(this.route.url);
    this.transactionType = this.route.url.split('/')[1] == 'sale' ? 0 : 1;

    // API Call to get data
    

    this.handleRangeChange();
  }

  handleRangeChange(): void {
    let filterVal = this.filterForm.get('range')?.value;
    let curDate = new Date();
    let start = null, end = null;
    if (filterVal == TimeFilterEnum.CurMonth){
      start = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
      end = new Date(curDate.getFullYear(), curDate.getMonth()+1, 0);
    } else if (filterVal == TimeFilterEnum.LastMonth){
      start = new Date(curDate.getFullYear(), curDate.getMonth()-1, 1);
      end = new Date(curDate.getFullYear(), curDate.getMonth(), 0);
    } else if (filterVal == TimeFilterEnum.CurQuarter){
      
    } else if (filterVal == TimeFilterEnum.CurYear){
      start = new Date(curDate.getFullYear(), 0, 1);
      end = new Date(curDate.getFullYear() + 1, 0, 0);
      console.log(start);

    } else if (filterVal == TimeFilterEnum.All){
      start = ''
      end = curDate;
    } else {
        start = '';
        end = '';
    }

    this.filterForm.patchValue({
      startDate: start == '' ? '' : this.formatDate(start),
      endDate: end == '' ? '' : this.formatDate(end),
    });

    this.filterData();
  }

  private formatDate(date: any): string {
    if(date == ''){
      return date;
    }
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  handlePrintClick(invNo: number){
    console.log(invNo);
  }

  handleShareClick(invNo: number){
    console.log(invNo);
  }

  filterData(ev?: any){
    if(ev){
      console.log(ev.target.id);
    }
    let startTimestamp = Date.parse(this.filterForm.get('startDate')?.value as string);
    let start = new Date(startTimestamp);
    let endTimestamp = Date.parse(this.filterForm.get('endDate')?.value as string);
    let end = new Date(endTimestamp);

    // Api Call if required
    this.saleData = saleData.filter(item => {
      let itemTimestamp = Date.parse(item.date);
      let itemDate = new Date(itemTimestamp);
      return (itemDate >= start && itemDate <= end);
    });

    // console.log(filteredData);
  }

}
