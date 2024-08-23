import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  registeredPhoneNumber: number;
  youllreceive: number;
  youllpay: number;
  totalsale: number;
  totalpurchase: number;
  stockvalue: number;
  cashinhand: number;
  bankamount: number;
  lowstocks: any[];
  youllpayreceiveparty: any[];
  bankaccounts: any[];
  purchasedash: any[];
  constructor(public api: ApiService, public dataService: DataService){}

  ngOnInit(){
    this.registeredPhoneNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    
    this.api.getDashboardDetails(this.registeredPhoneNumber).subscribe((response: any) => {
      if (response.status === "Success") {
        this.youllreceive = response.youllreceive
        this.youllpay = response.youllpay
        this.totalsale = response.totalsale
        this.totalpurchase = response.totalpurchase
        this.stockvalue = response.stockvalue 
        this.cashinhand = response.cashinhand   
        this.bankamount = response.bankamount    
        this.lowstocks = response.lowstocks
        this.youllpayreceiveparty = response.youllpayreceiveparty
        this.bankaccounts = response.bankaccounts
        this.purchasedash = response.purchasedash
        console.log(" this.lowstocks",  this.lowstocks)
      } else {
        console.error('Failed ', response.statusmessage);
      }
    });
  }

}
