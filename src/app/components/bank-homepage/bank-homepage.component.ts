import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BanksComponent } from '../banks/banks.component';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';
import { ApiService } from 'src/app/services/api.service';
import { Bank } from 'src/app/models';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-bank-homepage',
  templateUrl: './bank-homepage.component.html',
  styleUrls: ['./bank-homepage.component.css']
})
export class BankHomepageComponent implements OnInit {
  selectedBank: any = ''; 
  registeredPhoneNmber: number;
  bankslist: Bank[] = [];
  transactions: any[] = [];
  isbanksupdateflag: boolean = false;
  private clickTimeout: any;
  private singleClickFlag = false;
  
  constructor(public dialog: MatDialog, public api: ApiService, public dataService: DataService) {
    this.registeredPhoneNmber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
  }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    const body = {
      registeredphonenumber: this.registeredPhoneNmber
    };

    this.api.getAccounts(body).subscribe((response: any) => {
      if (response.status === "SUCCESS") {
        this.selectedBank = response.accountdisplayname
        this.bankslist = response.bankslist.map((bank: any) => ({
          accountdisplayname: bank.accountdisplayname,
          amount: bank.amount
        }));
        
        if (this.bankslist.length > 0) {
          this.getTransactions(this.bankslist[0].accountdisplayname);
        }
      } else {
        console.error('Failed to fetch accounts:', response.statusmessage);
      }
    });
  }

  getTransactions(accountName: string): void {
    const body = {
      registeredphonenumber: this.registeredPhoneNmber,
      accountdisplayname: accountName
    };

    this.api.getbanksDetails(body).subscribe((response: any) => {
      if (response.status === "SUCCESS") {
        this.selectedBank = body.accountdisplayname
        this.transactions = response.bankTrnxDetails.map((transaction: any) => ({
          type: transaction.typeofpay,
          name: transaction.customername,
          date: new Date(transaction.invoicedate).toLocaleDateString(), // Format date as needed
          amount: transaction.amount,
          transactionid: transaction.transactionid
        }));
      } else {
        console.error('Failed to fetch transactions:', response.statusmessage);
      }
    });
  }

  handleClick(bank: Bank) {
    this.selectedBank = bank.accountdisplayname
    if (this.singleClickFlag) {
      // Handle double click
      clearTimeout(this.clickTimeout);
      this.singleClickFlag = false;
      this.isbanksupdateflag = true;
      this.openAddBanksModal(bank);
    } else {
      // Handle single click
      this.singleClickFlag = true;
      this.clickTimeout = setTimeout(() => {
        if (this.singleClickFlag) {
          this.singleClickFlag = false;
          this.getTransactions(bank.accountdisplayname);
        }
      }, 300); // Adjust timeout as needed
    }
  }

  openModal(event: any) {
    const selectedValue = event.value;
    let data: any = {};
    const body = {
      registeredphonenumber: this.registeredPhoneNmber
    };
  
    this.api.getAccounts(body).subscribe((response: any) => {
      if (response.status === "SUCCESS") {
        this.selectedBank = response.accountdisplayname
        const accounts = response.bankslist.map((bank: any) => ({
          name: bank.accountdisplayname,
          amount: bank.amount
        }));
  
        switch (selectedValue) {
          case 'bankToCash':
            data.fromAccounts = accounts;
            data.toAccount = 'CASH';
            break;
          case 'cashToBank':
            data.fromAccount = 'CASH';
            data.toAccounts = accounts;
            break;
          case 'bankToBank':
            data.fromAccounts = accounts;
            data.toAccounts = accounts;
            break;
          case 'adjustBalance':
            data.accountNames = accounts;
            break;
        }
  
        const dialogRef = this.dialog.open(TransferModalComponent, {
          width:'70%',
          height:'70%',
          data: { type: selectedValue, ...data }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadBanks();
          }
        });
      } else {
        console.error('Failed to fetch accounts:', response.statusmessage);
      }
    });
  }

  openAddBanksModal(bank?: Bank): void {
    const data = bank ? { ...bank, isbanksupdateflag: this.isbanksupdateflag } : { isbanksupdateflag: this.isbanksupdateflag };
    const dialogRef = this.dialog.open(BanksComponent, {
      width: '60%',
      height: '60%',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modal closed with result:', result);
        this.loadBanks();
      }
    });
  }

  isSelectedBank(bankName: any): boolean {
    return this.selectedBank === bankName;
  }
}
