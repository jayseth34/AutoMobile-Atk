import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-inout',
  templateUrl: './payment-inout.component.html',
  styleUrls: ['./payment-inout.component.css']
})
export class PaymentInoutComponent implements OnInit {
  paymentInForm: FormGroup;
  partyList: any[] = [];
  balance: number = 0;
  typeofpay :any = 'PAYMENT IN';
  receivedValue: number | undefined; // Track received value separately
  receiptno:any;
  registeredphonenumber: number;
  partyName:any;
  paymentType: any;

  constructor(private fb: FormBuilder, private api: ApiService, private dataService : DataService, private router: Router, private cs: CommonService) {
    this.balance = 0;
  }

  ngOnInit() {
    this.registeredphonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
    this.paymentType = "Cash";
    this.getPartyList();
    this.paymentInForm = this.fb.group({
      party: ['', Validators.required],
      paymentType: ['', Validators.required],
      receiptNo: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
      received: ['', Validators.required]
    });
  }

  getPartyList() {
    this.api.getPartyList(this.registeredphonenumber).subscribe(data => {
      if (data.status === 'SUCCESS') {
        this.partyList = data.getPartyList;
      } else {
        console.error('Failed to load party list:', data.status);
      }
    });
  }

  calculateBalance(party: any): number {
    let calculatedBalance = 0;
    if (this.typeofpay === 'PAYMENT IN') {
      this.dataService.typeofpay = 'PAYMENT IN';
      calculatedBalance = party.toreceivefromparty;
      this.dataService.toreceivefromparty = party.toreceivefromparty
    } else if (this.typeofpay === 'PAYMENT OUT') {
      this.dataService.typeofpay = 'PAYMENT OUT';
      calculatedBalance = party.topayparty;
      this.dataService.topayparty = party.topayparty
    }
    return calculatedBalance;
  }

  onPartyChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    const selectedParty = this.partyList[selectedIndex - 1];
    if (selectedParty) {
      this.balance = this.calculateBalance(selectedParty)
      this.partyName = selectedParty.partyname
      this.dataService.partyName = this.partyName
      this.receivedValue = this.balance
    } else {
      this.balance = 0;
    }
  }

  onSubmit() {
    if (this.paymentInForm.valid) {
      console.log('Form Submitted', this.paymentInForm.value);
    }
  }

  linkPayment() {
    if(this.cs.isUndefineOrNull(this.partyName)){
      Swal.fire({ text : "Kindly Enter Party Name" })
    } else if(this.receivedValue == 0){
      Swal.fire({ text : "Kindly Enter An amount In The Received Input Field" })
    }
    else if (this.cs.isUndefineOrNull(this.receiptno)){
      Swal.fire({ text : "Kindly Enter Receipt No Input Field" })

    }
    else{
      this.router.navigate(['/linked']);
    }
  }
  updateReceivedValue(value: number) {
    this.receivedValue = value;
    this.dataService.received = value;
    if(this.receivedValue > this.balance){
      Swal.fire({ text : "Received Value Cannot Be More Than Balance"}).then(() => {
        this.receivedValue = 0
      })
    }
  }
  updateReceiptValue(value:any){
    this.receiptno = value;
    this.dataService.invoicenumber = this.receiptno;
    console.log(this.receiptno)
  }
  updatepaymenttype(value:any){
    this.paymentType = value;
    this.dataService.paymentType = value;
    console.log(this.paymentType)
  }
}
