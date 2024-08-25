import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.css']
})
export class TransferModalComponent {
  transferForm: FormGroup;
  registeredPhoneNmber: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public api: ApiService,
    private dialogRef: MatDialogRef<TransferModalComponent>
  ) {
    // Initialize the form with default values
    this.transferForm = this.fb.group({
      fromAccount: [data.type === 'cashToBank' ? 'CASH' : ''],
      toAccount: [''],
      amount: [''],
      adjustmentDate: [''],
      description: [''],
      adjustmentType: [''],
      accountName: [''] // Add accountName here
    });

    

    this.registeredPhoneNmber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );

    if (data.type === 'adjustBalance') {
      this.transferForm.addControl('accountName', this.fb.control(''));
      this.transferForm.addControl('adjustmentType', this.fb.control(''));
    }

    if (data.fromAccount === 'CASH') {
      this.transferForm.get('fromAccount')?.setValue('CASH');
    }

    if (data.toAccount === 'CASH') {
      this.transferForm.get('toAccount')?.setValue('CASH');
    }

    if (data.type === 'bankToCash' || data.type === 'bankToBank') {
      this.transferForm.get('fromAccount')?.setValue(data.fromAccounts ? data.fromAccounts[0]?.id : '');
    }

    if (data.type === 'cashToBank') {
      this.transferForm.get('fromAccount')?.setValue('CASH');
    }

    if (data.type === 'bankToBank') {
      this.transferForm.get('fromAccount')?.setValue(data.fromAccounts ? data.fromAccounts[0]?.id : '');
      this.transferForm.get('toAccount')?.setValue(data.toAccounts ? data.toAccounts[0]?.id : '');
    }

    if (data.type === 'adjustBalance') {
      this.transferForm.get('accountName')?.setValue(data.accountNames ? data.accountNames[0]?.id : '');
    }

    this.setValidators()

    if(this.data.isupdate){
      this.patchValues()
    }
  }

  patchValues(): void {
    // Patch common values
    this.transferForm.patchValue({
      fromAccount: this.data.from,
      toAccount: this.data.to,
      amount: this.data.amount,
      adjustmentDate: this.data.date,
      description: this.data.description,
      adjustmentType: this.data.increasedecrease,
      accountName: this.data.from
    });

    // Additional logic for specific cases
    if (this.data.type === 'cashToBank') {
      this.transferForm.patchValue({ fromAccount: 'CASH' });
    }

    if (this.data.type === 'bankToCash') {
      this.transferForm.patchValue({ toAccount: 'CASH' });
    }

    if (this.data.type === 'bankToBank') {
      this.transferForm.patchValue({
        fromAccount: this.data.from,
        toAccount: this.data.banktobank
      });
    }

    if (this.data.type === 'adjustBalance') {
      this.transferForm.patchValue({
        accountName: this.data.from,
        adjustmentType: this.data.increasedecrease
      });
    }
  }


  setValidators(): void {
    const type = this.data.type;

    if (type === 'bankToCash' || type === 'bankToBank') {
      this.transferForm.get('fromAccount')?.setValidators(Validators.required);
      this.transferForm.get('toAccount')?.setValidators(Validators.required);
    } else if (type === 'cashToBank') {
      this.transferForm.get('toAccount')?.setValidators(Validators.required);
      this.transferForm.get('fromAccount')?.setValue('CASH'); // Automatically set 'CASH'
    } else if (type === 'adjustBalance') {
      this.transferForm.get('accountName')?.setValidators(Validators.required);
      this.transferForm.get('adjustmentType')?.setValidators(Validators.required);
    }

    // Set the validators
    this.transferForm.get('fromAccount')?.updateValueAndValidity();
    this.transferForm.get('toAccount')?.updateValueAndValidity();
    this.transferForm.get('amount')?.updateValueAndValidity();
    this.transferForm.get('adjustmentDate')?.updateValueAndValidity();
    this.transferForm.get('description')?.updateValueAndValidity();
    this.transferForm.get('adjustmentType')?.updateValueAndValidity();
    this.transferForm.get('accountName')?.updateValueAndValidity();
  }

  getTitle(type: string): string {
    switch (type) {
      case 'bankToCash':
        return 'Bank to Cash Transfer';
      case 'cashToBank':
        return 'Cash to Bank Transfer';
      case 'bankToBank':
        return 'Bank to Bank Transfer';
      case 'adjustBalance':
        return 'Adjust Bank Balance';
      default:
        return 'Transaction';
    }
  }

  submit() {
    const adjustmentDate = this.transferForm.get('adjustmentDate')?.value;
    const formattedDate = adjustmentDate ? new Date(adjustmentDate).toISOString() : null;
    if (this.transferForm.valid) {
      console.log(this.transferForm.value)
      let body = {
        ...this.transferForm.value,
        registeredphonenumber: this.registeredPhoneNmber,
        type: this.data.type,
        adjustmentDate:formattedDate
      }
      console.log(body)
      this.api.transfers(body).subscribe((response:any) => {
        if(response.status == "SUCCESS"){
          this.dialogRef.close({ success: true });
        }
      })
    }
  }
}
