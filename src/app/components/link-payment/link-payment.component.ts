import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { LinkedTransaction } from 'src/app/models';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-link-payment',
  templateUrl: './link-payment.component.html',
  styleUrls: ['./link-payment.component.css'],
})
export class LinkPaymentComponent {
  transactions: LinkedTransaction[] = [];
  received: number;
  totalUnused: number;
  unused: number;
  typeofpay: any;
  registeredphonenumber: number;
  customername: string;
  invoicenumber: number;

  constructor(
    private api: ApiService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registeredphonenumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.customername = this.dataService.partyName;
    this.loadTransactions(this.registeredphonenumber, this.customername);
    this.received = this.dataService.received;
    this.totalUnused = this.received;
    this.typeofpay = this.dataService.typeofpay;
    this.invoicenumber = this.dataService.invoicenumber;
  }

  loadTransactions(registeredPhoneNumber: number, customerName: string) {
    this.api
      .getTransactions(registeredPhoneNumber, customerName, this.dataService.typeofpay)
      .subscribe((data) => {
        if (data.status === 'SUCCESS') {
          this.transactions = data.getLinkedPaymentTransactionList.map(
            (item: any) => ({
              invoicedate: moment(item.invoicedate).format('YYYY-MM-DD'),
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
              registeredphonenumber: this.registeredphonenumber,
              customername: item.customername,
              paymentininvoicenumber: this.invoicenumber,
            })
          );
          this.updateTotalUnused();
        } else if (data.status === 'FAILED' && data.statusmessage == "No Records Found") {
          Swal.fire({
            text: data.statusmessage + "To link",
            allowOutsideClick: false,
          }).then((res: any) => {
            this.router.navigate(['Payment-In']);
          });
        }
      });
  }

  updateLinkedAmount(transaction: LinkedTransaction) {
    if (transaction.disabled) {
        // When disabling a transaction
        if (this.totalUnused > 0) {
            const maxLinkedAmount = Math.min(this.totalUnused, transaction.balance);
            transaction.linkedAmount += maxLinkedAmount;
            transaction.balance -= maxLinkedAmount;
            transaction.unused = maxLinkedAmount;
            this.updateTotalUnused();
        } else {
            Swal.fire({
                text: 'You Have No Unused Amount Left',
                allowOutsideClick: false,
            }).then(() => {
                transaction.disabled = false; // Revert the checkbox to enabled
                
            });
        }
    } else {
        // When enabling a transaction
        transaction.balance = transaction.originalBalance;
        this.totalUnused += transaction.unused;
        transaction.linkedAmount = transaction.originalLinkedAmount;
        transaction.unused = 0; // Reset unused amount since it's being re-enabled
        this.updateTotalUnused(); // Update total unused amount
    }
}

  updateTotalUnused() {
    const totalLinkedAmount = this.transactions
      .filter(
        (transaction) => transaction.disabled && transaction.linkedAmount !== 0
      )
      .reduce((total, transaction) => total + transaction.unused, 0);
    this.totalUnused = this.received - totalLinkedAmount;
  }

  reset() {
    this.transactions.forEach((transaction) => {
      transaction.disabled = false;
      transaction.balance = transaction.originalBalance;
      transaction.linkedAmount = transaction.originalLinkedAmount;
    });
    this.totalUnused = this.received;
  }

  autoLinkTransactions() {
    let remainingAmount = this.totalUnused;
  
    this.transactions.forEach((transaction) => {
      if (!transaction.disabled && remainingAmount > 0) {
        const maxLinkableAmount = Math.min(remainingAmount, transaction.balance);
        transaction.linkedAmount = maxLinkableAmount;
        transaction.balance -= maxLinkableAmount;
        remainingAmount -= maxLinkableAmount;
        transaction.unused = transaction.linkedAmount; // Update unused field
        transaction.disabled = true; // Mark the transaction as linked
      }
    });
    
    this.totalUnused = remainingAmount; // Directly update totalUnused
  }

  saveChanges() {
    const updatedTransactions: LinkedTransaction[] = this.transactions.filter(
      (transaction) =>
        transaction.linkedAmount !== transaction.originalLinkedAmount ||
        transaction.balance !== transaction.originalBalance
    );
    if (this.totalUnused != 0) {
      Swal.fire({ text: 'Kindly Use Entire Linked Amount To Save Changes' });
      return;
    }
    if (updatedTransactions.length > 0) {
      updatedTransactions.forEach((transaction) => {
        if (this.typeofpay === 'PAYMENT IN') {
          transaction.toreceivefromparty -= this.received;
        } else if (this.typeofpay === 'PAYMENT OUT') {
          transaction.topayparty -= this.received;
        }
      });
    }
    console.log(updatedTransactions)
    if (updatedTransactions.length > 0) {
      console.log(updatedTransactions)
      this.api.updateTransactions(updatedTransactions).subscribe((response) => {
        if (response.status === 'SUCCESS') {
          let body = {
            invoicenumber: this.invoicenumber,
            received: this.received,
            paymenttype: this.dataService.paymentType,
            customername: this.customername,
            typeofpay: this.typeofpay,
            registeredphonenumber: this.registeredphonenumber,
            paymentininvoicenumber: this.dataService.invoicenumber,
            invoicedate: this.dataService.invoicedate,
            amountdetails: this.dataService.amountdetails
          };
          this.api.UpdatePaymentInOutTrnx(body).subscribe((res: any) => {
            if (res.status == 'SUCCESS') {
              if(this.typeofpay == "PAYMENT IN")
                this.router.navigate(['Payment-In/']);
              else if (this.typeofpay == "PAYMENT OUT")
                this.router.navigate(['Payment-Out/'])
            }
          });
        } else {
          Swal.fire({ text: 'Something Went Wrong.' });
        }
      });
    } else {
      console.log('No changes to save');
    }
    this.router.navigate(['inout']);
  }
}
