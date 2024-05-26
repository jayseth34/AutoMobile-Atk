import { AfterViewInit, Component, OnInit, ViewChild, ɵɵi18nApply } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { TransactionTypeEnum, TimeFilterEnum } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';
import { Transaction } from 'src/app/models';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, AfterViewInit {
  // TransactionType = TransactionTypeEnum // just gets the datatype
  filters = ["All Purchase Invoice", "Current Month", "Last Month", "Current Quarter", "Current Year", "Custom"];
  transactionType: TransactionTypeEnum = TransactionTypeEnum.Sale;
  transactionTypeString: string;
  paidVal: number = 0;
  unpaidVal: number = 0;
  totalVal: number = 0;
  fullData: any = [];
  transactonData: MatTableDataSource<Transaction>;
  phonenumber: number;

  // For Mat Table
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  displayedColumns: string[] = ['invoicedate', 'invoicenumber', 'customername', 'typeofpay', 'paymenttype', 'total', 'balance', 'icons', 'option'];

  // Form Groups
  filterForm = new FormGroup({
    range: new FormControl<TimeFilterEnum>(TimeFilterEnum.CurMonth),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  constructor(private route: Router, private api: ApiService) {
    this.transactonData = new MatTableDataSource();
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.transactonData.sort = this.sort;
  }

  ngOnInit(): void {
    // Remove this!
    // localStorage.setItem("phonenumber", "9920279905");
    this.transactionType = this.route.url.split('/')[1] == 'Sale' ? 0 : 1;
    this.transactionTypeString = TransactionTypeEnum[this.transactionType];
    this.phonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));

    // API Call to get data
    this.api.getTypeOfTransactions(this.transactionTypeString, this.phonenumber).subscribe((res) => {
      if (res.status === "SUCCESS") {
        // Setting the inv count
        let curInvCount = res?.invoicenumbercount;
        localStorage.setItem("curInvCount", JSON.stringify(curInvCount));

        if (res.typeofpaytransactionlist != null) {
          this.fullData = res.typeofpaytransactionlist;
          // console.log(this.fullData);
          this.handleRangeChange();
        }
      }
    });
  }

  handleRangeChange(): void {
    let filterVal = this.filterForm.get('range')?.value;
    let curDate = new Date();
    let start = null, end = null;
    if (filterVal == TimeFilterEnum.CurMonth) {
      start = new Date(curDate.getFullYear(), curDate.getMonth(), 1);
      end = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 0);
    } else if (filterVal == TimeFilterEnum.LastMonth) {
      start = new Date(curDate.getFullYear(), curDate.getMonth() - 1, 1);
      end = new Date(curDate.getFullYear(), curDate.getMonth(), 0);
    } else if (filterVal == TimeFilterEnum.CurQuarter) {

    } else if (filterVal == TimeFilterEnum.CurYear) {
      start = new Date(curDate.getFullYear(), 0, 1);
      end = new Date(curDate.getFullYear() + 1, 0, 0);
      // console.log(start);

    } else if (filterVal == TimeFilterEnum.All) {
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
    if (date == '') {
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

  handlePrintClick(invNo: number) {
    // console.log(invNo);
  }

  handleShareClick(invNo: number) {
    // console.log(invNo);
  }

  filterData(ev?: any) {
    if (ev) {
      // console.log(ev.target.id);
    }

    let startTimestamp = Date.parse(this.filterForm.get('startDate')?.value as string);
    let start = new Date(startTimestamp);
    let endTimestamp = Date.parse(this.filterForm.get('endDate')?.value as string);
    let end = new Date(endTimestamp);

    // Api Call if required
    this.transactonData.data = this.fullData.filter((item: any) => {
      let itemDate = new Date(item.invoicedate);
      this.updatePayment(item.paymentstatus, item.balance, item.total)
      return (itemDate >= start && itemDate <= end && item.typeofpay == TransactionTypeEnum[this.transactionType].toUpperCase());
    });
    // console.log(this.transactonData);
  }

  applyFilter(ev: Event) {
    const filterVal = (ev.target as HTMLInputElement).value;
    this.transactonData.filter = filterVal.trim().toLowerCase();;
  }

  updatePayment(payStatus: string, payBal: number, payTotal: number): void {
    this.totalVal += payTotal;
    if (payStatus === "UNPAID") {
      this.unpaidVal += payBal;
    } else if (payStatus === "PARTIAL") {
      this.unpaidVal += payBal;
      this.paidVal += (payTotal - payBal);
    } else {
      this.paidVal += payTotal;
    }
  }

  tableSort(data: any, sortHeaderId: string): string | number {
    // console.log(data, sortHeaderId);
    return sortHeaderId;
  }

}
