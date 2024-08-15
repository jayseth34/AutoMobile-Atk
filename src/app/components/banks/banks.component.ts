import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
  bankForm: FormGroup;
  accounts: Account[] = [];

  constructor(private fb: FormBuilder, public api: ApiService) {}

  ngOnInit() {
    this.bankForm = this.fb.group({
      accountDisplayName: ['', Validators.required],
      openingBalance: ['', Validators.required],
      asOfDate: ['', Validators.required],
      transferType: [''],
      fromAccount: [{ value: '', disabled: true }],
      toAccount: [''],
      amount: [''],
      adjustmentDate: [''],
      accountName: [{ value: '', disabled: true }],
      adjustmentType: [''],
      description: ['']
    });

    this.bankForm.get('accountDisplayName')?.valueChanges.subscribe(value => {
      if (this.isTransferVisible('adjustBalance')) {
        this.bankForm.patchValue({ accountName: value }, { emitEvent: false });
      } else if (this.isTransferVisible('cashToBank', 'bankToCash', 'bankToBank')) {
        this.bankForm.patchValue({ fromAccount: value }, { emitEvent: false });
      }
    });

    this.bankForm.patchValue({ transferType: 'none' }, { emitEvent: false });
    const selectedType = this.bankForm.get('transferType')?.value;
    this.isTransferVisible(selectedType)
    // this.api.getAccounts().subscribe((data:any) => {
    //   this.accounts = data;
    // });
  }

  onTransferTypeChange(event: any) {
    const selectedType = this.bankForm.get('transferType')?.value;
    const accountDisplayName = this.bankForm.get('accountDisplayName')?.value;

    this.clearTransferFields(); // Reset the fields

    if (selectedType === 'adjustBalance') {
      this.bankForm.get('accountName');
      this.bankForm.patchValue({ accountName: accountDisplayName });
    } else if (selectedType === 'bankToCash' || selectedType === 'cashToBank' || selectedType === 'bankToBank') {
      this.bankForm.get('fromAccount');
      this.bankForm.patchValue({ fromAccount: accountDisplayName });
    }
  }

  isTransferVisible(...types: string[]) {
    const selectedType = this.bankForm.get('transferType')?.value;
    return types.includes(selectedType);
  }

  clearTransferFields() {
    this.bankForm.patchValue({
      fromAccount: '',
      toAccount: '',
      amount: '',
      adjustmentDate: '',
      accountName: '',
      adjustmentType: '',
      description: ''
    });
  }

  submitForm() {
    if (this.bankForm.valid) {
      this.api.saveTransferDetails(this.bankForm.value).subscribe((response : any) => {
        console.log('Transfer details saved:', response);
      });
    }
  }
}