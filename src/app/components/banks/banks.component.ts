import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
  
  bankForm: FormGroup;
  registeredPhoneNmber: number;
  isUpdateMode: boolean;
  oldaccountDisplayName: string;
  oldopeningbalance:number;
  amount:number;
  
  constructor(private fb: FormBuilder, public api: ApiService, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<BanksComponent>) {}

  ngOnInit() {
    this.bankForm = this.fb.group({
      newaccountDisplayName: ['', Validators.required],
      newopeningBalance: ['', Validators.required],
      asOfDate: [new Date().toISOString().split('T')[0], Validators.required], // Default date set to today
    });

    this.registeredPhoneNmber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );

    this.isUpdateMode = this.data.isbanksupdateflag || false;
    
    if (this.isUpdateMode) {
      this.oldaccountDisplayName = this.data.accountdisplayname;
      this.fetchBankDetails(this.oldaccountDisplayName);
    }
  }

  fetchBankDetails(accountDisplayName: string) {
    let body = {
      registeredphonenumber:this.registeredPhoneNmber,
      newaccountdisplayname: accountDisplayName
    }
    this.api.GetBanksDetailsValues(body).subscribe((response: any) => {
      if (response.status === "SUCCESS") {
        const { newaccountdisplayname, newopeningbalance, asofDate, amount } = response;
        this.bankForm.patchValue({
          newaccountDisplayName: newaccountdisplayname,
          newopeningBalance: newopeningbalance,
          asOfDate: new Date(asofDate)
        });
        this.oldaccountDisplayName = newaccountdisplayname
        this.oldopeningbalance = newopeningbalance
        this.amount = amount
      } else {
        console.error('Failed to fetch bank details:', response.statusmessage);
      }
    });
  }

  submitForm() {
    if(!this.isUpdateMode){
      this.oldaccountDisplayName = this.bankForm.get('newaccountDisplayName')?.value;
      this.oldopeningbalance = this.bankForm.get('newopeningBalance')?.value;
    }
    if (this.bankForm.valid) {
      const formData = {
        ...this.bankForm.value,
        registeredphonenumber: this.registeredPhoneNmber,
        isbanksupdate : this.isUpdateMode,
        oldaccountdisplayname: this.oldaccountDisplayName,
        oldopeningbalance: this.oldopeningbalance,
        typeofpay: 'OPENING BALANCE',
        amount:this.amount
      };
        this.api.SaveBankDetails(formData).subscribe((response: any) => {
          if(response.status == "SUCCESS"){
            this.dialogRef.close({ success: true });
          } else {
            Swal.fire({text:response.statusmessage})
          }
        })
      
    }
  }
}
