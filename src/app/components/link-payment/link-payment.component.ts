import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { LinkedTransaction } from 'src/app/models';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-link-payment',
  templateUrl: './link-payment.component.html',
  styleUrls: ['./link-payment.component.css']
})
export class LinkPaymentComponent {
  transactions: LinkedTransaction[] = [];
  received: number;
  totalUnused: number;
  unused: number;
  typeofpay:any;
  registeredphonenumber:number;
  customername:string;

  constructor(private api: ApiService, private dataService : DataService, private router : Router) {}

  ngOnInit() {
    this.registeredphonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
    this.customername = this.dataService.partyName;
    this.loadTransactions(this.registeredphonenumber, this.customername);
    this.received = this.dataService.received;
    this.totalUnused = this.received;
    this.typeofpay = this.dataService.typeofpay;
  }

  loadTransactions(registeredPhoneNumber: number, customerName: string) {
    this.api.getTransactions(registeredPhoneNumber, customerName).subscribe(data => {
      if (data.status === 'SUCCESS') {
        this.transactions = data.getLinkedPaymentTransactionList.map((item: any) => ({
          invoicedate: item.invoicedate,
          typeofpay: item.typeofpay,
          invoicenumber: item.invoicenumber,
          total: item.total,
          balance: item.balance,
          topayparty: this.dataService.topayparty,
          toreceivefromparty: this.dataService.toreceivefromparty,
          linkedAmount: item.linkedamount,
          disabled: false,
          originalLinkedAmount: item.linkedamount,
          originalBalance: item.balance,
          unused: item.linkedamount,
          registeredphonenumber: 9920279905,
          customername: item.customername
        }));
        this.updateTotalUnused();
      } else {
        console.error('Failed to load transactions:', data.status);
      }
    });
  }

  updateLinkedAmount(transaction: LinkedTransaction) {
  if (transaction.disabled) {
    const maxLinkedAmount = Math.min(this.totalUnused, transaction.balance);
    transaction.linkedAmount += maxLinkedAmount;
    transaction.balance -= maxLinkedAmount;
    transaction.unused = maxLinkedAmount;

    this.updateTotalUnused();
  } else {
    transaction.balance = transaction.originalBalance;
    transaction.linkedAmount = transaction.originalLinkedAmount;
    this.totalUnused = this.received;
  }
}

updateTotalUnused() {
  const totalLinkedAmount = this.transactions
    .filter(transaction => transaction.disabled && transaction.linkedAmount !== 0)
    .reduce((total, transaction) => total + transaction.unused, 0);

  this.totalUnused = this.received - totalLinkedAmount;
}

  reset() {
    this.transactions.forEach(transaction => {
      transaction.disabled = false;
      transaction.balance = transaction.originalBalance;
      transaction.linkedAmount = transaction.originalLinkedAmount;
    });
    this.totalUnused = this.received;
  }

  saveChanges() {
    const updatedTransactions: LinkedTransaction[] = this.transactions
      .filter(transaction => transaction.linkedAmount !== transaction.originalLinkedAmount || transaction.balance !== transaction.originalBalance);
    if(this.totalUnused != 0){
      Swal.fire({ text : "Kindly Use entire Linked Amount To Save Changes"})
      return;
    }
    if (updatedTransactions.length > 0) {
      updatedTransactions.forEach(transaction => {
        if (this.typeofpay === 'PAYMENT IN') {
          transaction.toreceivefromparty -= this.received;
        } else if (this.typeofpay === 'PAYMENT OUT') {
          transaction.topayparty -= this.received;
        }
      });
    }
    if (updatedTransactions.length > 0) {
      this.api.updateTransactions(updatedTransactions).subscribe(response => {
        if (response.status === 'SUCCESS') {
          console.log('Transactions updated successfully');
        } else {
          console.error('Failed to update transactions:', response.status);
        }
      });
    } else {
      console.log('No changes to save');
    }
    this.router.navigate(['inout']);
  }
}