import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { LinkedTransaction } from 'src/app/models';

@Component({
  selector: 'app-link-payment',
  templateUrl: './link-payment.component.html',
  styleUrls: ['./link-payment.component.css']
})
export class LinkPaymentComponent {
  transactions: LinkedTransaction[] = [];
  received: number = 10; // Example initial value
  totalUnused: number = 10; // Initially totalUnused is the same as received
  unused: number;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTransactions(9920279905, 'JAY');
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
          linkedAmount: item.linkedamount,
          disabled: false,
          originalLinkedAmount: item.linkedamount,
          originalBalance: item.balance,
          unused: item.linkedamount,
          registeredphonenumber: 9920279905
        }));
        this.updateTotalUnused();
      } else {
        console.error('Failed to load transactions:', data.status);
      }
    });
  }

  updateLinkedAmount(transaction: LinkedTransaction) {
  if (transaction.disabled) {
    // Calculate the maximum amount that can be linked
    const maxLinkedAmount = Math.min(this.totalUnused, transaction.balance);

    // Update linkedAmount and balance
    transaction.linkedAmount += maxLinkedAmount;
    transaction.balance -= maxLinkedAmount;
    transaction.unused = maxLinkedAmount;

    // Update totalUnused after linking
    this.updateTotalUnused();
  } else {
    // Restore original values from API
    transaction.balance = transaction.originalBalance;
    transaction.linkedAmount = transaction.originalLinkedAmount;

    // Reset totalUnused to received
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
  }
}