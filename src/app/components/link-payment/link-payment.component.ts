import { Component } from '@angular/core';

interface Transaction {
  date: string;
  type: string;
  refNo: string;
  total: number;
  balance: number;
  linkedAmount: number;
  disabled: boolean;
}

@Component({
  selector: 'app-link-payment',
  templateUrl: './link-payment.component.html',
  styleUrls: ['./link-payment.component.css']
})
export class LinkPaymentComponent {
  transactions: Transaction[] = [
    { date: '20/04/2024', type: 'Sale', refNo: '25', total: 95.00, balance: 19.85, linkedAmount: 0, disabled: false },
    { date: '21/04/2024', type: 'Sale', refNo: '27', total: 0.15, balance: 0.15, linkedAmount: 0, disabled: false },
    { date: '27/04/2024', type: 'Sale', refNo: '34', total: 15.00, balance: 15.00, linkedAmount: 0, disabled: false },
    { date: '20/04/2024', type: 'Sale', refNo: '25', total: 95.00, balance: 19.85, linkedAmount: 0, disabled: false },
    { date: '21/04/2024', type: 'Sale', refNo: '27', total: 0.15, balance: 0.15, linkedAmount: 0, disabled: false },
    { date: '27/04/2024', type: 'Sale', refNo: '34', total: 15.00, balance: 15.00, linkedAmount: 0, disabled: false }
  ];

  received: number = 1000;
  totalUnused: number = 1000; // Initial value equals to received

  updateTotalUnused() {
    // Calculate the total linked amount of checked transactions
    const totalLinkedAmount = this.transactions
      .filter(transaction => transaction.disabled && transaction.linkedAmount !== 0)
      .reduce((total, transaction) => total + transaction.linkedAmount, 0);

    // Update totalUnused by subtracting totalLinkedAmount from received
    this.totalUnused = this.received - totalLinkedAmount;
  }

  updateLinkedAmount(transaction: Transaction) {
    if (transaction.disabled) {
      // Check if received amount is greater than balance
      if (this.received >= transaction.balance) {
        // Subtract balance from received and assign it to linked amount
        transaction.linkedAmount = transaction.balance;
      } else {
        // If received amount is not greater than balance, linked amount is 0
        transaction.linkedAmount = 0;
      }
    } else {
      // If checkbox is unchecked, reset linked amount to 0
      transaction.linkedAmount = 0;
    }
  
    // Update the totalUnused
    this.updateTotalUnused();
  }

  reset() {
    // Reset all transactions and totalUnused
    this.transactions.forEach(transaction => {
      transaction.disabled = false;
      transaction.linkedAmount = 0;
    });
    this.totalUnused = this.received;
  }
}
