import { AfterViewInit, Component, OnInit, ViewChild, ɵɵi18nApply } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { TransactionTypeEnum, TimeFilterEnum } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';
import { Transaction } from 'src/app/models';
import { CommonService } from 'src/app/services/common.service';
import { Location } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RemoveHyphenPipe } from 'src/app/remove-hyphen.pipe';

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
  showFilterSection: boolean = true;

  // For Mat Table
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  displayedColumns: string[] = ['invoicedate', 'invoicenumber', 'customername', 'typeofpay', 'paymenttype', 'total', 'balance', 'icons', 'option'];

  // Form Groups
  filterForm = new FormGroup({
    range: new FormControl<TimeFilterEnum>(TimeFilterEnum.CurYear),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  constructor(private _route: ActivatedRoute, private _api: ApiService, private _location: Location, private _router: Router, public dataService : DataService) {
    this.transactonData = new MatTableDataSource();
  }

  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.transactonData.sort = this.sort;
  }

  ngOnInit(): void {
    // TODO: Handling when the order is already converted.
    this._route.paramMap.subscribe((params: ParamMap) => {
      this.phonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
      if(!params.has("type")){
        this._location.back();
      }

      this.transactionTypeString = params.get("type") as string;
      // Add conditions here if required
      switch(this.transactionTypeString){
        case "Sale":
          this._router.navigate(['Sale-Invoce']);
          break;
        case "Purchase":
          this._router.navigate(['Purchase-Bills']);
          break;
        case "Sale-Invoice":
          this.transactionTypeString = 'Sale';
          this.showFilterSection = true;
          this.transactionType = 0;
          break;
        case "Purchase-Bills":
          this.transactionTypeString = 'Purchase';
          this.showFilterSection = true;
          this.transactionType = 1;
          break;
        case "Sale-Order":
          this.showFilterSection = false;
          this.transactionType = 4;
          break;
        case "Purchase-Order":
          this.showFilterSection = false;
          this.transactionType = 5;
          break;
        case "Delivery-Challan":
          this.showFilterSection = false;
          this.transactionType = 6;
          break;

        case "Payment-In":
          this.showFilterSection = false;
          this.transactionType = 3;
          break;
        case "Payment-Out":
            this.showFilterSection = false;
            this.transactionType = 7;
            break;
        case "Estimate-Quotation":
          this.showFilterSection = false;
          this.transactionType = 8;
          break;
        case "Sale-Return":
          this.showFilterSection = false;
          this.transactionType = 9;
          break;
        case "Purchase-Return":
          this.showFilterSection = false;
          this.transactionType = 10;
          break;
        case "Advance-In":
          this.showFilterSection = false;
          this.transactionType = 11;
          break;
        case "Advance-Out":
          this.showFilterSection = false;
          this.transactionType = 12;
          break;
      
      }
      

      // API Call to get data
    this._api.getTypeOfTransactions(this.transactionTypeString.replace('-', ' '), this.phonenumber).subscribe((res) => {
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
    });
    // this.transactionType = this.route.url.split('/')[1] == 'Sale' ? 0 : 1;
    // this.transactionTypeString = TransactionTypeEnum[this.transactionType];
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
  
    let startDateValue = this.filterForm.get('startDate')?.value;
    let endDateValue = this.filterForm.get('endDate')?.value;
  
    // Check if custom filter is selected and no date range is provided
    if (!startDateValue && !endDateValue && this.filterForm.get('range')?.value === TimeFilterEnum.Custom) {
      this.totalVal = 0;
      this.unpaidVal = 0;
      this.paidVal = 0;
  
      // Display all data
      this.transactonData.data = [...this.fullData];
  
      // Update payment values
      this.fullData.forEach((item: any) => {
        this.updatePayment(item.paymentstatus, item.balance, item.total);
      });
  
      return;
    }
  
    let startTimestamp = Date.parse(startDateValue as string);
    let start = new Date(startTimestamp);
    start.setHours(0, 0, 0, 0);
    let endTimestamp = Date.parse(endDateValue as string);
    let end = new Date(endTimestamp);
    end.setHours(0, 0, 0, 0);
  
    // Resetting the initial values
    this.totalVal = 0;
    this.unpaidVal = 0;
    this.paidVal = 0;
  
    // Filter data based on date range and transaction type
    this.transactonData.data = this.fullData.filter((item: any) => {
      let itemDate = new Date(item.invoicedate);
      this.updatePayment(item.paymentstatus, item.balance, item.total);
      return (
        itemDate >= start &&
        itemDate <= end &&
        item.typeofpay == TransactionTypeEnum[this.transactionType].toUpperCase().replace('-', ' ')
      );
    });
  }

  applyFilter(ev: Event) {
    const filterVal = (ev.target as HTMLInputElement).value;
    this.transactonData.filter = filterVal.trim().toLowerCase();;
  }

  updatePayment(payStatus: string, payBal: number, payTotal: number): void {
    // console.log(payStatus)
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

  getRouterLink() {
    this.dataService.isview = false
    if (this.transactionTypeString === 'Payment-In' || this.transactionTypeString === 'Payment-Out') {
      if(this.transactionTypeString === 'Payment-In')
        this.dataService.typeofpay = 'PAYMENT IN'
      else if (this.transactionTypeString === 'Payment-Out')
        this.dataService.typeofpay = 'PAYMENT OUT'
      return this._router.navigateByUrl('/pin');
    } else if (this.transactionTypeString === 'Advance-In' || this.transactionTypeString === 'Advance-Out') {
        this.dataService.hidelinkpayment = true
        if(this.transactionTypeString === 'Advance-In')
          this.dataService.typeofpay = 'ADVANCE IN'
        else if (this.transactionTypeString === 'Advance-Out')
          this.dataService.typeofpay = 'ADVANCE OUT'
        return this._router.navigateByUrl('/pin');
    }
    return this._router.navigateByUrl(`/${this.transactionTypeString}/add`);
  }

  getEditLink(invoiceNumber: number, isPrint: boolean = false) {
    if (this.transactionTypeString === 'Payment-In' || this.transactionTypeString === 'Payment-Out') {
      this.dataService.invoicenumber = invoiceNumber;
      this.dataService.isview = true;
      this.dataService.typeofpay =
        this.transactionTypeString === 'Payment-In' ? 'PAYMENT IN' : 'PAYMENT OUT';
  
      this.navigateToPageAndPrint('/pin', isPrint);
      return;
    } else if (this.transactionTypeString === 'Advance-In' || this.transactionTypeString === 'Advance-Out') {
      this.dataService.invoicenumber = invoiceNumber;
      this.dataService.isview = true;
      this.dataService.hidelinkpayment = true;
      this.dataService.typeofpay =
        this.transactionTypeString === 'Advance-In' ? 'ADVANCE IN' : 'ADVANCE OUT';
  
      this.navigateToPageAndPrint('/pin', isPrint);
      return;
    }
  
    this.dataService.isview = false;
    this.navigateToPageAndPrint(`/${this.transactionTypeString}/edit/${invoiceNumber}`, isPrint);
  }

  generateExcel() {
    const transactions = this.fullData;
    
    const excludedParams = ['isconverted'];
  
    const headers = Object.keys(transactions[0]).filter(
      (key) => !excludedParams.includes(key)
    );
  
    const rows = transactions.map((obj: any) => 
      headers.map((header) => obj[header])
    );
  
    const worksheetData = [headers, ...rows];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), 'transactions.xlsx');
  }
  
  
  private navigateToPageAndPrint(route: string, isPrint:boolean) {
    this._router.navigateByUrl(route).then(() => {
      setTimeout(() => {
        if(isPrint){
          window.print();
        }
      }, 1000);
    });
  }

}
