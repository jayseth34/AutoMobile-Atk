import { Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, AbstractControl, Validators, FormsModule } from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import * as moment from 'moment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


import Swal from 'sweetalert2';


@Component({
  selector: 'app-add-party',
  templateUrl: './add-party.component.html',
  styleUrls: ['./add-party.component.css']
})

export class AddPartyComponent implements OnInit {
  selectedTab: string = 'gstAndAddress'; // Initially select the 'address' tab
  isOpeningBalance: boolean = false;
  isShippingAddressEnabled: boolean = true;
  isCustomLimit: boolean = false;
  customLimit: any; 
  partyBalance: any = 0;
  registeredPhoneNumber: any = '';
  partyName: any = '';
  gst: any = '';
  phoneNumber: any = 0;
  partyGroup: any = '';
  gstType: any = '';
  _state: any = '';
  emailId: any = '';
  billingAddress: any = '';
  shippingAddress: any = '';
  openingBalance: any = 0;
  toPayOrReceive: any = '';
  asOfDate: any ;
  creditLimit: any = 0;
  // isPartyUpdate: boolean = true;
  oldPartyName: any = '';
  //For additional column names
  additionalFieldName1:any = '';
  additionalFieldName2: any = '';
  additionalFieldName3: any = '';
  additionalFieldName4: any = '';  
  //For additional column's vale
  additionalFieldName1Value:any = '';
  additionalFieldName2Value: any = '';
  additionalFieldName3Value: any = '';
  additionalFieldName4Value: any;  
  typeOfPay: any = '';
  labelText: string = 'No Limit';
  showPrint: string= 'Dont show in print';
  selectedOption:string ='';
  additionalField1Checked: boolean = false;
  additionalField2Checked: boolean = false;
  additionalField3Checked: boolean = false;
  additionalField4Checked: boolean = false;
  isAdditionalField1Checked: boolean = false;
  isAdditionalField2Checked: boolean = false;
  isAdditionalField3Checked: boolean = false;
  isAdditionalField4Checked: boolean = false;
  ifFormSubmitted: boolean = false;
  //to show in print
  showAdditionalField1: boolean = false;
  showAdditionalField2: boolean = false;
  showAdditionalField3: boolean = false;
  showAdditionalField4: boolean = false;
  addPartyForm: UntypedFormGroup;

  isSaveAndNew: boolean = false;

  
  @Input() partyDetails: any;

  constructor(private api: ApiService, public dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any) {
    // this.partyDetails = data.partyDetails; // Access the injected data
  }

  ngOnInit(): void {
    this.asOfDate = moment().format('YYYY-MM-DDTHH:mm:ss');
    this.additionalFieldName4Value = moment().format('YYYY-MM-DDTHH:mm:ss');
    // const today = moment().format('DD-MM-YYYY');
    // this.showPrint = 'Dont show in print';

    // debugger;
    this.addPartyForm = new UntypedFormGroup({
      partyNameControl: new UntypedFormControl('', [Validators.required]),
      gstControl: new UntypedFormControl('',),
      phoneNumberControl: new UntypedFormControl('',Validators.pattern("^[0-9]*$")),
      partyGroupControl: new UntypedFormControl('', [Validators.required]),
      gstTypeControl: new UntypedFormControl('',),
      _stateControl: new UntypedFormControl('',),
      emailIdControl: new UntypedFormControl('', [Validators.email]),
      billingAddressControl: new UntypedFormControl('',),
      shippingAddressControl: new UntypedFormControl('',),
      openingBalanceControl: new UntypedFormControl('',Validators.pattern("^[0-9]*$")),
      toPayOrReceiveControl: new UntypedFormControl('',),
      asOfDateControl: new UntypedFormControl('',),
      creditLimitControl: new UntypedFormControl('',Validators.pattern("^[0-9]*$")),
      additionalFieldName1Control: new UntypedFormControl('',),
      additionalFieldName2Control: new UntypedFormControl('',),
      additionalFieldName3Control: new UntypedFormControl('',),
      additionalFieldName4Control: new UntypedFormControl('',),
      additionalField1ValueControl: new UntypedFormControl('',), 
      additionalField2ValueControl: new UntypedFormControl('',),
      additionalField3ValueControl: new UntypedFormControl('',),
      additionalField4ValueControl: new UntypedFormControl('',),   
      additionalField1CheckedControl: new UntypedFormControl('',),
      additionalField2CheckedControl: new UntypedFormControl('',),
      additionalField3CheckedControl: new UntypedFormControl('',),
      additionalField4CheckedControl: new UntypedFormControl('',),
    });
    
    if(this.data.status='SUCCESS'){
      this.populateForm(this.data.partyDetails) 
    }
  }
  
  populateForm(partyDetails: any) {
    if (partyDetails) {
        this.partyName = this.data.partyName
        this.gst= partyDetails.gst
        this.phoneNumber= partyDetails.phonenumber
        this.partyGroup= partyDetails.partygroup
        this.gstType= partyDetails.gsttype
        this._state= partyDetails._state
        this.emailId= partyDetails.emailid
        this.billingAddress= partyDetails.billingaddress
        this.shippingAddress= partyDetails.shippingaddress
        this.openingBalance= partyDetails.openingbalance
        this.asOfDate= partyDetails.asofdate
        this.creditLimit= partyDetails.creditlimit
        this.additionalFieldName1= partyDetails.additionalfieldname1
        this.additionalFieldName2= partyDetails.additionalfieldname2
        this.additionalFieldName3= partyDetails.additionalfieldname3
        this.additionalFieldName4= partyDetails.additionalfieldname4
        this.additionalFieldName1Value= partyDetails.additionalfieldname1value
        this.additionalFieldName2Value= partyDetails.additionalfieldname2value
        this.additionalFieldName3Value= partyDetails.additionalfieldname3value
        this.additionalFieldName4Value= partyDetails.additionalfieldname4value
        this.toPayOrReceive= partyDetails.topayorreceive
        this.partyBalance= partyDetails.partybalance
    }
  }
    
  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleShippingAddress() {
    this.isShippingAddressEnabled = !this.isShippingAddressEnabled;
    if(!this.isShippingAddressEnabled) {
      Swal.fire({
        title: 'Disable Shipping Address',
        text: 'Are you sure you want to disable shipping address for this party?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Disable',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          this.isShippingAddressEnabled = !this.isShippingAddressEnabled;
        }
      });
    }
  }

  /////////// improvement required
  updateLabel(event: any) {
    // debugger;
    this.labelText = event.target.checked ? 'Custom limit' : 'No limit';
    this.isCustomLimit = event.target.checked; 
  }

  showInPrint(event: any, field: string) {
    // this.showPrint = event.target.checked ? 'Show in Print' : 'Dont show in print';
    const checked = event.target.checked;
    switch(field){
      case 'additionalField1Checked':
        this.showAdditionalField1 = checked;
        console.log('show1:', this.showAdditionalField1)
        break;

      case 'additionalField2Checked':
        this.showAdditionalField2 = checked;
        console.log('show2:', this.showAdditionalField2)
        break;

      case 'additionalField3Checked':
        this.showAdditionalField3 = checked;
        console.log('show3:', this.showAdditionalField3)
        break;

      case 'additionalField4Checked':
        this.showAdditionalField4 = checked;
        console.log('show4:', this.showAdditionalField4)
        break;

      default:
        break;
    }
  }

  // toggleCreditLimit() {
  //   this.isCustomLimit = !this.isCustomLimit;
  //   if (!this.isCustomLimit) {
  //     this.customLimit = 0;
  //   }
  // }
  // /////////

  // addParty() {
  //   debugger
  //   const obj = this.addPartyForm.value;
  //   console.log(obj);
  // }

  submit(isSaveAndNew: boolean) {
    // debugger;
    this.ifFormSubmitted = true;
    if(this.addPartyForm.valid) {
    if(this.openingBalance!=null) {
      this.checkTypeOfPay();
      // if(this.toPayOrReceive === 'pay'){
      //   console.log('pay')
        
      // } else 
      // if (this.toPayOrReceive === 'receive'){
      //   console.log('recive')
      // }
    } 

    // this.addPartyForm.get('toPayOrReceiveControl')?.valueChanges.subscribe(value => {
    //   this.selectedOption = value;  // Update the flag whenever the radio button changes
    //   console.log("Selected option: ", this.selectedOption); // You can see the selected option in the console
    // });
    // this.checkTypeOfPay()
    this.AddPartyData(this.addPartyForm.value);
    if(isSaveAndNew){
      this.addPartyForm.reset();
    }
  } else {
      Swal.fire({
        title: 'Validation Error!',
        text: 'One or more validation error has occured. Please fill all the required fields.',
        confirmButtonText: 'OK',
      })
  }
  }

  
  // isPayRecieve(ev:any) { //not req : used only for displaying two bullets
  //   if(ev.length == 0){
  //     this.isOpeningBalance = false
  //   } else{
  //     this.isOpeningBalance = true
  //   }
  // }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddPartyData(body: any): Promise<void> {
    // debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        partyBalance: this.partyBalance,
        registeredPhoneNumber: 9920279905,
        partyName: this.partyName,
        gst: this.gst,
        phoneNumber: this.phoneNumber,
        partyGroup: this.partyGroup,
        gstType: this.gstType,
        _state: this._state,
        emailId: this.emailId,
        billingAddress: this.billingAddress,
        shippingAddress: this.shippingAddress,
        openingBalance: this.openingBalance,
        toPayOrReceive: this.toPayOrReceive,
        asOfDate:this.asOfDate,
        creditLimit: this.creditLimit,
        additionalFieldName1: this.additionalFieldName1,
        additionalFieldName2: this.additionalFieldName2,
        additionalFieldName3: this.additionalFieldName3,
        additionalFieldName4: this.additionalFieldName4,
        additionalFieldName1Value: this.additionalFieldName1Value,
        additionalFieldName2Value: this.additionalFieldName2Value,
        additionalFieldName3Value: this.additionalFieldName3Value,
        additionalFieldName4Value: this.additionalFieldName4Value,
        typeOfPay: this.typeOfPay,
        oldPartyName: this.partyName,
        isPartyUpdate: this.dataService.isPartyUpdate
      }
      if(this.dataService.isPartyUpdate){
        body.oldPartyName = this.dataService.oldPartyName
      }
      this.api.AddPartyDetails(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res.status != null) {
          Swal.fire({
            text: res.status,
            confirmButtonText: 'OK',
          })
        }
        else{
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  checkTypeOfPay() {
    // Use optional chaining to safely access the control, and provide a default value ('') if it's null
    console.log(this.isOpeningBalance)
    // debugger;
    // const controlValue = this.addPartyForm.get('toPayOrReceiveControl')?.value ?? '';
    if (this.toPayOrReceive === 'PAY') {
      this.typeOfPay = "PAYABLE OPENING BALANCE";
      this.openingBalance = -this.openingBalance;
      console.log('To pay is selected: ', this.openingBalance);
    } else if (this.toPayOrReceive === 'RECEIVE') {
      this.typeOfPay = "RECEIVABLE OPENING BALANCE";
      console.log('To receive is selected');
    }
  }

  // toggleAdditionalField(additionalFieldNo: any) {
  //   debugger
  //   if(additionalFieldNo==="additionalField1Checked"){
  //     this.isAdditionalField1Checked = true;
  //   } else{
  //     this.isAdditionalField1Checked = false;
  //   }
  //   if(additionalFieldNo=="additionalField2Checked"){
  //     this.isAdditionalField2Checked = true;
  //   }
  //   else{
  //     this.isAdditionalField2Checked = false;
  //   }
  //   if(additionalFieldNo=="additionalField3Checked"){
  //     this.isAdditionalField3Checked = true;
  //   }
  //   else{
  //     this.isAdditionalField3Checked = false;
  //   }
  //   if(additionalFieldNo=="additionalField4Checked"){
  //     this.isAdditionalField4Checked = true;
  //   }else{
  //     this.isAdditionalField4Checked = false;
  //   }
  // }
  toggleAdditionalField(event: any, field: string) {
    const isChecked = event.target.checked;
  
    switch (field) {
      case 'additionalField1':
        this.isAdditionalField1Checked = isChecked;
        if (this.isAdditionalField1Checked) {
          this.addPartyForm.get('additionalFieldName1Control')?.setValidators([Validators.required]);
          this.addPartyForm.get('additionalField1ValueControl')?.setValidators([Validators.required]);
        } else {
          this.addPartyForm.get('additionalFieldName1Control')?.clearValidators();
          this.addPartyForm.get('additionalFieldName1Control')?.setValue('');
          this.addPartyForm.get('additionalField1ValueControl')?.clearValidators();
          this.addPartyForm.get('additionalField1ValueControl')?.setValue('');
        }
        // Update the validation status
        this.addPartyForm.get('additionalFieldName1Control')?.updateValueAndValidity();
        this.addPartyForm.get('additionalField1ValueControl')?.updateValueAndValidity();
        break;
      case 'additionalField2':
        this.isAdditionalField2Checked = isChecked;
        if (this.isAdditionalField2Checked) {
          this.addPartyForm.get('additionalFieldName2Control')?.setValidators([Validators.required]);
          this.addPartyForm.get('additionalField2ValueControl')?.setValidators([Validators.required]);
        } else {
          this.addPartyForm.get('additionalFieldName2Control')?.clearValidators();
          this.addPartyForm.get('additionalFieldName2Control')?.setValue('');
          this.addPartyForm.get('additionalField2ValueControl')?.clearValidators();
          this.addPartyForm.get('additionalField2ValueControl')?.setValue('');
        }
        // Update the validation status
        this.addPartyForm.get('additionalFieldName2Control')?.updateValueAndValidity();
        this.addPartyForm.get('additionalField2ValueControl')?.updateValueAndValidity();
        break;
      case 'additionalField3':
        this.isAdditionalField3Checked = isChecked;
        if (this.isAdditionalField3Checked) {
          this.addPartyForm.get('additionalFieldName3Control')?.setValidators([Validators.required]);
          this.addPartyForm.get('additionalField3ValueControl')?.setValidators([Validators.required]);
        } else {
          this.addPartyForm.get('additionalFieldName3Control')?.clearValidators();
          this.addPartyForm.get('additionalFieldName3Control')?.setValue('');
          this.addPartyForm.get('additionalField3ValueControl')?.clearValidators();
          this.addPartyForm.get('additionalField3ValueControl')?.setValue('');
        }
        // Update the validation status
        this.addPartyForm.get('additionalFieldName3Control')?.updateValueAndValidity();
        this.addPartyForm.get('additionalField3ValueControl')?.updateValueAndValidity();
        break;
      case 'additionalField4':
        this.isAdditionalField4Checked = isChecked;
        if (this.isAdditionalField4Checked) {
          this.addPartyForm.get('additionalFieldName4Control')?.setValidators([Validators.required]);
          this.addPartyForm.get('additionalField4ValueControl')?.setValidators([Validators.required]);
        } else {
          this.addPartyForm.get('additionalFieldName4Control')?.clearValidators();
          this.addPartyForm.get('additionalFieldName4Control')?.setValue('');
          this.addPartyForm.get('additionalField4ValueControl')?.clearValidators();
          this.addPartyForm.get('additionalField4ValueControl')?.setValue('');
        }
        // Update the validation status
        this.addPartyForm.get('additionalFieldName4Control')?.updateValueAndValidity();
        this.addPartyForm.get('additionalField4ValueControl')?.updateValueAndValidity();
        break;
      default:
        break;
    }
  }
  

  updateValue(ev: any) {
    this.toPayOrReceive = ev.target.value;
    console.log('Selected option:', this.toPayOrReceive);
    // debugger;
    // this.addPartyForm.get('toPayorReceiveControl')?.setValue(value);
  }

  // validateCheckbox(){
  //           this.addPartyForm.get('additionalField1CheckedControl')?.valueChanges.subscribe((isAdditionalField1Checked) => {
  //         if(isAdditionalField1Checked)  {
  //           this.addPartyForm.get('additionalFieldName1Control')?.setValidators([Validators.required]);
  //           this.addPartyForm.get('additionalField1ValueControl')?.setValidators([Validators.required]);
  //         }
  //         else {
  //           this.addPartyForm.get('additionalFieldName1Control')?.clearValidators();
  //           this.addPartyForm.get('additionalField1ValueControl')?.clearValidators();
  //         }
  //       });
  // }

  get partyNameControl() { return this.addPartyForm.get('partyNameControl')}
  get gstControl() { return this.addPartyForm.get('gstControl')}
  get phoneNumberControl() { return this.addPartyForm.get('phoneNumberControl')}
  get partyGroupControl() { return this.addPartyForm.get('partyGroupControl')}
  get gstTypeControl() { return this.addPartyForm.get('gstTypeControl')}
  get _stateControl() { return this.addPartyForm.get('_stateControl')}
  get emailIdControl() { return this.addPartyForm.get('emailIdControl')}
  get billingAddressControl() { return this.addPartyForm.get('billingAddressControl')}
  get shipppingAddressControl() { return this.addPartyForm.get('shipppingAddressControl')}
  get openingBalanceControl() { return this.addPartyForm.get('openingBalanceControl')}
  get toPayOrReceiveControl() { return this.addPartyForm.get('toPayOrReceiveControl')}
  get asOfDateControl() { return this.addPartyForm.get('asOfDateControl')}
  get creditLimitControl() { return this.addPartyForm.get('creditLimitControl')}
  get additionalFieldName1Control() { return this.addPartyForm.get('additionalFieldName1Control')}
  get additionalFieldName2Control() { return this.addPartyForm.get('additionalFieldName2Control')}
  get additionalFieldName3Control() { return this.addPartyForm.get('additionalFieldName3Control')}
  get additionalFieldName4Control() { return this.addPartyForm.get('additionalFieldName4Control')}
  get additionalFieldName1ValueControl() { return this.addPartyForm.get('additionalFieldName1ValueControl')}
  get additionalFieldName2ValueControl() { return this.addPartyForm.get('additionalFieldName2ValueControl')}
  get additionalFieldName3ValueControl() { return this.addPartyForm.get('additionalFieldName3ValueControl')}
  get additionalFieldName4ValueControl() { return this.addPartyForm.get('additionalFieldName4ValueControl')}
  get additionalField1CheckedControl() { return this.addPartyForm.get('additionalField1CheckedControl')}
  get additionalField2CheckedControl() { return this.addPartyForm.get('additionalField2CheckedControl')}
  get additionalField3CheckedControl() { return this.addPartyForm.get('additionalField3CheckedControl')}
  get additionalField4CheckedControl() { return this.addPartyForm.get('additionalField4CheckedControl')}

}
