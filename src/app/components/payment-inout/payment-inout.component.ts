import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-inout',
  templateUrl: './payment-inout.component.html',
  styleUrls: ['./payment-inout.component.css']
})
export class PaymentInoutComponent implements OnInit {
  paymentInForm: FormGroup;
  partyList: any[] = [];
  balance: number = 0;
  typeofpay: any;
  receivedValue: number; // Track received value separately
  receiptno: number;
  registeredphonenumber: number;
  partyName: any;
  paymentType: any;
  totalAmount: number = 0;
  amount1Value: number = 0;
  isview: boolean = false;

  constructor(private fb: FormBuilder, private api: ApiService, private dataService: DataService, private router: Router, private cs: CommonService) {
    this.balance = 0;
  }

  ngOnInit() {
    this.registeredphonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
    this.typeofpay = this.dataService.typeofpay
    this.isview = this.dataService.isview
    this.getPartyList();
    this.paymentInForm = this.fb.group({
      party: ['', Validators.required],
      payments: this.fb.array([]),
      receiptNo: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
      received: ['', Validators.required]
    });

    this.paymentInForm.get('received')?.valueChanges.subscribe(value => {
      this.receivedValue = parseFloat(value);
      if ((this.receivedValue > this.balance) && !this.isview) {
        Swal.fire('Warning', 'Received amount cannot exceed balance', 'warning');
        this.paymentInForm.get('received')?.setValue(this.balance); // Revert to balance
      }
    });

    let body = {
      registeredphonenumber: this.registeredphonenumber,
      invoicenumber: this.dataService.invoicenumber,
      typeofpay: this.typeofpay
    }
    if (this.isview) {
      this.api.GetUpdatedTrnxInOutVal(body).subscribe((response: any) => {
        if (response.status === "SUCCESS") {
          this.patchFormValues(response);
        }
      });
    } else {
      this.addPayment()
    }
  }

  patchFormValues(data: any) {
    this.paymentInForm.patchValue({
      party: data.partyname,
      receiptNo: data.invoicenumber,
      date: data.invoicedate,
      received: data.received
    });
    this.balance = data.received

    data.amountdetails.forEach((payment: any) => {
      const paymentGroup = this.fb.group({
        type: [payment.type, Validators.required],
        amount: [payment.amount, Validators.required],
        refno: [payment.refno]
      });

      this.payments.push(paymentGroup);
    });
    this.calculateTotal()
  }

  get payments(): FormArray {
    return this.paymentInForm.get('payments') as FormArray;
  }

  addPayment() {
    console.log('Adding payment block');
    const isFirstPaymentGroup = this.payments.length === 0;

  // Create a new payment group
  const paymentGroup = this.fb.group({
    type: [isFirstPaymentGroup ? 'CASH' : '', Validators.required],
    amount: [0, Validators.required],
    refno: ['']
  });

    paymentGroup.get('amount')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    this.payments.push(paymentGroup);
    this.calculateTotal();
  }

  removePayment(index: number) {
    if (this.payments.length <= 1) {
      Swal.fire('Error', 'You must have at least one payment entry.', 'error');
      return; // Exit the method if only one payment group remains
    }
  
    this.payments.removeAt(index);
    this.calculateTotal(); // Update total amount
  }

  calculateTotal() {
    let total = 0;
    this.payments.controls.forEach(payment => {
      const amount = payment.get('amount')?.value || 0;
      total += parseFloat(amount); // Ensure the value is parsed as a number
    });
    this.totalAmount = total;
  }

  getPartyList() {
    this.api.getPartyList(this.registeredphonenumber).subscribe(data => {
      if (data.status === 'SUCCESS') {
        if (this.typeofpay === "PAYMENT IN") {
          this.partyList = data.getPartyList.filter((party: any) => party.toreceivefromparty > 0);
        } else if (this.typeofpay === "PAYMENT OUT") {
          this.partyList = data.getPartyList.filter((party: any) => party.topayparty > 0);
        }
      } else {
        console.error('Failed to load party list:', data.status);
      }
    });
  }

  calculateBalance(party: any): number {
    let calculatedBalance = 0;
    if (this.typeofpay === 'PAYMENT IN') {
      this.dataService.typeofpay = 'PAYMENT IN';
      calculatedBalance = party.toreceivefromparty;
    } else if (this.typeofpay === 'PAYMENT OUT') {
      this.dataService.typeofpay = 'PAYMENT OUT';
      calculatedBalance = party.topayparty;
    }
    return calculatedBalance;
  }

  onPartyChange(event: MatSelectChange) {
    const selectedParty = this.partyList.find(p => p.partyname === event.value);
    if (selectedParty) {
      this.dataService.partyName = selectedParty.partyname
      this.balance = this.calculateBalance(selectedParty);
      this.dataService.topayparty = selectedParty.topayparty
      this.dataService.toreceivefromparty = selectedParty.toreceivefromparty
      this.paymentInForm.get('received')?.setValue(this.balance);
      this.payments.clear();
      this.addPayment();
      if (this.payments.length > 0) {
        const firstPaymentGroup = this.payments.at(0);
        firstPaymentGroup.get('amount')?.setValue(this.balance);
      }
    }
  }

  updateReceivedValue(value: any) {
    this.receivedValue = parseFloat(value);
    if ((this.receivedValue > this.balance) && !this.isview) {
      Swal.fire('Warning', 'Received amount cannot exceed balance', 'warning');
      this.paymentInForm.get('received')?.setValue(this.balance); // Revert to balance
    }
  }

  updateReceiptValue(value: any) {
    this.receiptno = value;
  }

  handlePaymentTypeChange(index: number) {
    const paymentGroup = this.payments.at(index);
    const paymentType = paymentGroup.get('type')?.value;
  
    // Check for duplicate payment types
    const paymentTypes = this.payments.controls.map(control => control.get('type')?.value);
    const isDuplicate = paymentTypes.filter(type => type === paymentType).length > 1;
  
    if (isDuplicate) {
      Swal.fire('Error', 'The payment type already exists in the list', 'error');
      paymentGroup.get('type')?.setValue(''); // Clear duplicate payment type
      return; // Exit function
    }
  
    // Handle referenceNo visibility based on payment type
    if (paymentType === 'CASH') {
      paymentGroup.get('refno')?.setValue(null); // Set referenceNo to null
      paymentGroup.get('refno')?.disable(); // Hide referenceNo field
    } else {
      paymentGroup.get('refno')?.enable(); // Show referenceNo field
    }
  
    // Recalculate total whenever payment type changes
    this.calculateTotal();
  }

  shouldShowReferenceNo(index: number): boolean {
    const paymentGroup = this.payments.at(index);
    const paymentType = paymentGroup.get('type')?.value;
    return paymentType !== 'CASH'; // Show field if payment type is not Cash
  }

  linkPayment() {
    if (!this.paymentInForm.valid) {
      Swal.fire('Error', 'Please fill all required fields correctly in the main form.', 'error');
      return;
    }
  
    // Check each payment group for completeness
    let allPaymentsValid = true;
    this.payments.controls.forEach(paymentGroup => {
      if (!paymentGroup.valid) {
        allPaymentsValid = false;
      }
    });
  
    if (!allPaymentsValid) {
      Swal.fire('Error', 'Please fill all required fields in each payment entry.', 'error');
      return;
    }
    this.matchamounts()
  }

  matchamounts() {
    const totalPayments = this.totalAmount;
    const receivedAmount = this.receivedValue;

    if (totalPayments !== receivedAmount) {
      Swal.fire('Error', 'Total payments must be equal to the received amount', 'error');
    } else {
      console.log(this.paymentInForm.value);
      this.dataService.received = this.receivedValue;
      this.dataService.invoicenumber = parseInt(this.receiptno.toString());
      this.dataService.invoicedate = new Date(this.paymentInForm.get('date')?.value);
      this.dataService.amountdetails = this.payments.value
      const concatenatedPaymentTypes = this.payments.controls.map(paymentGroup =>
        paymentGroup.get('type')?.value
      ).filter(type => type).join(',');
      this.dataService.paymentType = concatenatedPaymentTypes;
      console.log(typeof(this.payments.value), this.dataService.invoicedate, this.dataService.topayparty, this.dataService.toreceivefromparty)
      this.router.navigateByUrl('inout');
      // Swal.fire('Success', 'Payment Linked', 'success');
    }
  }

  onSubmit() {
    if (this.paymentInForm.valid) {
      const formData = this.paymentInForm.value;
      formData.payments.forEach((payment:any) => {
        if (payment.paymentType === 'CASH') {
          payment.referenceNo = null;
        }
      });
      console.log('Form Data:', formData);
    } else {
      Swal.fire('Error', 'Please fill all required fields correctly', 'error');
    }
  }
}
