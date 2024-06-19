import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-payment-inout',
  templateUrl: './payment-inout.component.html',
  styleUrls: ['./payment-inout.component.css']
})
export class PaymentInoutComponent {
  paymentInForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.paymentInForm = this.fb.group({
      party: ['', Validators.required],
      paymentType: ['', Validators.required],
      receiptNo: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
      received: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.paymentInForm.valid) {
      console.log('Form Submitted', this.paymentInForm.value);
    }
  }

}
