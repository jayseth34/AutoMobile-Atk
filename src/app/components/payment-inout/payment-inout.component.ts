import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';

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

  constructor(private fb: FormBuilder, private api: ApiService, private dataService : DataService, private router: Router) {
    this.paymentInForm = this.fb.group({
      party: ['', Validators.required],
      paymentType: ['', Validators.required],
      receiptNo: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
      received: ['', Validators.required]
    });
    this.balance = 0;
  }

  ngOnInit() {
    this.getPartyList();
  }

  getPartyList() {
    const registeredPhoneNumber = 9920279905; // Use appropriate value
    this.api.getPartyList(registeredPhoneNumber).subscribe(data => {
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
    } else {
      this.balance = 0; // Reset balance if no party selected
    }
  }

  onSubmit() {
    if (this.paymentInForm.valid) {
      console.log('Form Submitted', this.paymentInForm.value);
      // Implement your submission logic here
    }
  }

  linkPayment() {
    // Implement linking payment logic
    this.router.navigate(['/linked']);
  }
  updateReceivedValue(value: number) {
    this.receivedValue = value;
    this.dataService.received = value; // Update DataService received value
  }
}
