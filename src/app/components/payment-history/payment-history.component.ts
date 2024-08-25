import { Component, OnInit } from '@angular/core';
import { TrnxInOut } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  showModal = false;
  payments: any[] = [];
  registeredphonenumber: number;

  constructor(public api: ApiService, public dataservice: DataService) { }

  ngOnInit(): void {
    this.registeredphonenumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.loadTrnxInOut(this.registeredphonenumber);
  }

  loadTrnxInOut(registeredPhoneNumber:number){
    let body = {
      registeredphonenumber : this.registeredphonenumber,
      invoicenumber : this.dataservice.invoicenumber,
      typeofpay: this.dataservice.typeofpay,
      issaleconvert: false,
      issaleorderconvert: false 
    }
    this.api.getTrnxInOut(body).subscribe((res:any) => {
      this.payments = res.inouttrnxlist.map((item:any) => ({
        invoicedate: item.invoicedate,
        invoicenumber: item.invoicenumber,
        typeofpay: item.typeofpay,
        linkedamount: item.linkedamount
      }))
    })
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getTotalAmount() {
    return this.payments.reduce((total, payment) => total + payment.linkedamount, 0);
  }
}