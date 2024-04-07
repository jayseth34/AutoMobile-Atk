import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { TransactionTypeEnum, TimeFilterEnum } from 'src/app/models';

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
    })
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
}
