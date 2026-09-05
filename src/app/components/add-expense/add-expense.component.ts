import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { ExpenseRq } from 'src/app/models';
import Swal from 'sweetalert2';

export const EXPENSE_CATEGORIES = [
  'Rent', 'Salary', 'Electricity', 'Fuel', 'Travel', 'Office Supplies',
  'Repairs & Maintenance', 'Telephone & Internet', 'Marketing', 'Other'
];

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css']
})
export class AddExpenseComponent implements OnInit {

  expenseForm: FormGroup;
  registeredPhoneNumber: number;
  isUpdateMode: boolean = false;
  expenseId: number = 0;
  categories: string[] = EXPENSE_CATEGORIES;
  bankAccounts: string[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddExpenseComponent>
  ) { }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(JSON.parse(localStorage.getItem('phonenumber') as string));

    this.expenseForm = this.fb.group({
      expensedate: [new Date(), Validators.required],
      category: ['', Validators.required],
      partyname: [''],
      description: [''],
      total: ['', [Validators.required, Validators.min(1)]],
      paymenttype: ['CASH', Validators.required],
    });

    this.isUpdateMode = !!this.data?.isexpenseupdate;
    if (this.isUpdateMode) {
      this.expenseId = this.data.expense_id;
      this.expenseForm.patchValue({
        expensedate: new Date(this.data.expensedate),
        category: this.data.category,
        partyname: this.data.partyname,
        description: this.data.description,
        total: this.data.total,
        paymenttype: this.data.amountdetailslist?.[0]?.type || 'CASH',
      });
    }

    this.loadBankAccounts();
  }

  loadBankAccounts(): void {
    this.api.getAccounts({ registeredphonenumber: this.registeredPhoneNumber }).subscribe((response: any) => {
      if (response.status === 'SUCCESS') {
        this.bankAccounts = (response.bankslist || []).map((bank: any) => bank.accountdisplayname);
      }
    });
  }

  submitForm(): void {
    if (!this.expenseForm.valid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.expenseForm.value;
    const req: ExpenseRq = {
      expense_id: this.expenseId,
      registeredphonenumber: this.registeredPhoneNumber,
      expensedate: new Date(formValue.expensedate).toISOString(),
      category: formValue.category,
      partyname: formValue.partyname || '',
      description: formValue.description || '',
      total: formValue.total,
      paymenttype: formValue.paymenttype,
      isexpenseupdate: this.isUpdateMode,
      amountdetailslist: [{ type: formValue.paymenttype, amount: formValue.total, refno: '' }],
    };

    this.api.saveOrUpdateExpense(req).subscribe((response: any) => {
      if (response.status === 'SUCCESS') {
        this.dialogRef.close({ success: true });
      } else {
        Swal.fire({ text: response.statusmessage || 'Something went wrong' });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
