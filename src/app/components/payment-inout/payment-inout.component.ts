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
  allPartyList: any[] = [];
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
  paymentOptions: any[] = [];
  isadvance: boolean;
  isUpdatingValue: any;

  constructor(public fb: FormBuilder, public api: ApiService, public dataService: DataService, public router: Router, public cs: CommonService) {
    this.balance = 0;
  }

  ngOnInit() {
    this.registeredphonenumber = parseInt(JSON.parse(localStorage.getItem("phonenumber") as string));
    this.receiptno = parseInt(localStorage.getItem("curInvCount") ?? "");
    this.typeofpay = this.dataService.typeofpay
    this.isview = this.dataService.isview
    this.dataService.hidelinkpayment = false
    const defaultDate = new Date(); 
    if(this.typeofpay == "ADVANCE IN" || this.typeofpay == "ADVANCE OUT"){
      this.isadvance = true
    }
    this.paymentInForm = this.fb.group({
      party: ['', Validators.required],
      payments: this.fb.array([]),
      receiptNo: [this.receiptno, Validators.required],
      date: [defaultDate, Validators.required],
      description: [''],
      received: ['', Validators.required]
    });
    let body = {
      registeredphonenumber: this.registeredphonenumber,
      invoicenumber: this.dataService.invoicenumber,
      typeofpay: this.typeofpay
    }
    
    this.getPartyList();
    this.getPaymentOptions()
    if (this.isview) {
      this.api.GetUpdatedTrnxInOutVal(body).subscribe((response: any) => {
        console.log('API Response:', response);
        if (response.status === "SUCCESS") {
          this.patchFormValues(response);
        }
      });
    } else {
      this.addPayment()
    }
    let isUpdatingValue = false;

  this.paymentInForm.get('received')?.valueChanges.subscribe(value => {
    if (!isUpdatingValue) {
      this.receivedValue = parseFloat(value);
      if (this.receivedValue > this.balance) {
        if (!this.isview && !this.isadvance) {
          Swal.fire('Warning', 'Received amount cannot exceed balance', 'warning');
          isUpdatingValue = true;
          this.paymentInForm.get('received')?.setValue(this.balance);
          isUpdatingValue = false;
        } else if (this.isadvance) {
          isUpdatingValue = true;
          this.paymentInForm.get('received')?.setValue(this.receivedValue);
          isUpdatingValue = false;
        }
      }
    }
  });
    
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
        this.allPartyList = data.getPartyList || [];

        // View/update should not be restricted; otherwise old records can become unselectable.
        if (this.isview || this.isadvance) {
          this.partyList = this.allPartyList;
        } else if (this.typeofpay === "PAYMENT IN") {
          // Payment coming in: show only parties with pending receive > 0
          this.partyList = this.allPartyList.filter((party: any) => Number(party.toreceivefromparty) > 0);
        } else if (this.typeofpay === "PAYMENT OUT") {
          // Payment going out: show only parties with pending pay > 0
          this.partyList = this.allPartyList.filter((party: any) => Number(party.topayparty) > 0);
        } else {
          this.partyList = this.allPartyList;
        }
        if (this.isview && this.typeofpay === "PAYMENT IN") {
          const selectedParty = this.partyList.find((party: any) => party.partyname === this.paymentInForm.get('party')?.value);
          if (selectedParty) {
            this.balance = selectedParty.toreceivefromparty; // Map value to this.balance
          }
        } else if (this.isview && this.typeofpay === "PAYMENT OUT") {
          const selectedParty = this.partyList.find((party: any) => party.partyname === this.paymentInForm.get('party')?.value);
          if (selectedParty) {
            this.balance = selectedParty.topayparty; // Map value to this.balance
          }
        } else if (this.isview && this.isadvance) {
            const selectedParty = this.partyList.find((party: any) => party.partyname === this.paymentInForm.get('party')?.value);
            if (selectedParty) {
              this.balance = selectedParty.toreceivefromparty - selectedParty.topayparty; // Map value to this.balance
            }
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
    } else if (this.typeofpay === 'ADVANCE OUT') {
      this.dataService.typeofpay = 'ADVANCE OUT';
      calculatedBalance = party.toreceivefromparty - party.topayparty;
      if (calculatedBalance < 0) {
        calculatedBalance = Math.abs(calculatedBalance);
      }    
    } else if (this.typeofpay === 'ADVANCE IN') {
      this.dataService.typeofpay = 'ADVANCE IN';
      calculatedBalance = party.toreceivefromparty - party.topayparty;
      if (calculatedBalance < 0) {
        calculatedBalance = Math.abs(calculatedBalance);
      }    
    }
    return calculatedBalance;
  }

  onPartyChange(event: MatSelectChange) {
    const selectedParty = this.partyList.find(p => p.partyname === event.value);
    if (selectedParty) {
      this.dataService.partyName = selectedParty.partyname
      this.balance = this.calculateBalance(selectedParty);
      // if (this.balance < 0) {
      //   this.balance = Math.abs(this.balance);
      // }
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
    if (this.isUpdatingValue) return; 
    this.isUpdatingValue = true; 
  
    if (value === '' || isNaN(value)) {
      this.paymentInForm.get('received')?.setValue(0); // Set to null or default value
      this.isUpdatingValue = false;
      return;
    }
    this.receivedValue = parseFloat(value);
  
    if (this.isadvance) {
      this.paymentInForm.get('received')?.setValue(this.receivedValue);
    } else {
      if (this.receivedValue > this.balance && !this.isview) {
        Swal.fire('Warning', 'Received amount cannot exceed balance', 'warning');
        this.paymentInForm.get('received')?.setValue(this.balance); // Revert to balance
      } else {
        this.paymentInForm.get('received')?.setValue(this.receivedValue);
      }
    }
    this.isUpdatingValue = false;
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

  getPaymentOptions() {
    let body = {
      registeredphonenumber:this.registeredphonenumber
    }
    this.api.getAccounts(body).subscribe((data:any) => {
      if (data.status === 'SUCCESS') {
        const apiOptions = data.bankslist.map((bank: any) => bank.accountdisplayname);
        this.paymentOptions = [...apiOptions, 'CASH', 'CHEQUE'];
      } else {
        console.error('Failed to load payment options:', data.status);
        this.paymentOptions = ['CASH', 'CHEQUE'];
      }
    });
  }

  saveadvanceinout(){
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

    this.dataService.amountdetails = this.payments.value
      const concatenatedPaymentTypes = this.payments.controls.map(paymentGroup =>
        paymentGroup.get('type')?.value
      ).filter(type => type).join(',');
      this.dataService.paymentType = concatenatedPaymentTypes;
      if(this.typeofpay == "ADVANCE IN")
        this.dataService.topayparty = this.dataService.topayparty + this.receivedValue
      else if (this.typeofpay == "ADVANCE OUT")
        this.dataService.toreceivefromparty = this.dataService.toreceivefromparty + this.receivedValue
    let body = {
      invoicenumber: this.receiptno,
      received: this.receivedValue,
      paymenttype: this.dataService.paymentType,
      customername: this.paymentInForm.get('party')?.value,
      typeofpay: this.typeofpay,
      registeredphonenumber: this.registeredphonenumber,
      paymentininvoicenumber: this.dataService.invoicenumber,
      invoicedate: this.paymentInForm.get('date')?.value,
      amountdetails: this.dataService.amountdetails,
      topayparty: this.dataService.topayparty,
      toreceivefromparty: this.dataService.toreceivefromparty
    };
    this.api.InsertAdvanceTrnx(body).subscribe((res:any) => {
      if(res.status == "SUCCESS"){
        if(this.typeofpay == "ADVANCE IN")
          this.router.navigate(['Advance-In/']);
        else if (this.typeofpay == "ADVANCE OUT")
          this.router.navigate(['Advance-Out/'])
      }
    })
  }
}
