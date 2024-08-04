import { ChangeDetectorRef, Component, Inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, AbstractControl, Validators, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import * as moment from 'moment';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';


import Swal from 'sweetalert2';
import { AddPartyGroupComponent } from '../add-party-group/add-party-group.component';
import { CommonService } from 'src/app/services/common.service';


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
  topayparty: any = 0;
  toreceivefromparty: any = 0; 
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
  partyGroupList: any =[];
  states: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  
  @Input() partyDetails: any;

  constructor(private dialog: MatDialog,private api: ApiService, public dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any, public cdr: ChangeDetectorRef, public cs: CommonService, public dialogRef: MatDialogRef<AddPartyComponent>) {
    // this.partyDetails = data.partyDetails; // Access the injected data
  }

  ngOnInit(): void {
    this.registeredPhoneNumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );
    this.initializeForm()
    this.cdr.detectChanges();
    
    // this.asOfDate = moment().format('YYYY-MM-DDTHH:mm:ss');
    // this.additionalFieldName4Value = moment().format('YYYY-MM-DDTHH:mm:ss');
    // const today = moment().format('DD-MM-YYYY');
    // this.showPrint = 'Dont show in print';
    // this.partyGroupList = this.dataService.partyGroupListResponse.map((group: { partygroup: any; }) => group.partygroup);
    // ;
    this.partygroup()

    if (!this.dataService.isPartyUpdate){
      this.partyGroup = 'GENERAL'
    }
    if(this.data.status='SUCCESS'){
      this.populateForm(this.data.partyDetails) 
      if (!this.cs.isUndefineOrNull(this.data.partyDetails.topayorreceive)) {
        this.toPayOrReceive = this.data.partyDetails.topayorreceive.toUpperCase();
      }
      if(this.data.partyDetails.creditlimit > 0){
        this.labelText = 'Custom Limit'
        this.isCustomLimit = true
      }
    }
  }

  formatDate(isoDateStr: string): string {
    const date = new Date(isoDateStr);
  
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getUTCFullYear();
  
    return `${day}-${month}-${year}`;
  }


  partygroup(){
    this.api.GetPartyGroup(this.registeredPhoneNumber).subscribe({
      next:(response) => {
        if(response.status == "SUCCESS") {
          this.dataService.partyGroupListResponse = response.getPartyGroupList
          console.log("GET PARTY GROUP SUCCESS", response)
        }
        else{
          console.log("PARTYGROUP FAILED")
        }
      },
      error:() => {
        console.log("PARTY GROUP ERROR")
      }
    })
  }

  initializeForm() {
    const defaultDate = moment().format('YYYY-MM-DD');
    this.addPartyForm = new FormGroup({
      partyNameControl: new FormControl(this.data.partyName || '', Validators.required),
      gstControl: new FormControl(this.data.partyDetails?.gst || ''),
      phoneNumberControl: new FormControl(this.data.partyDetails?.phonenumber || 0, Validators.pattern("^[0-9]*$")),
      partyGroupControl: new FormControl(this.data.partyDetails?.partygroup || 'GENERAL', Validators.required),
      gstTypeControl: new FormControl(this.data.partyDetails?.gsttype || ''),
      _stateControl: new FormControl(this.data.partyDetails?._state || ''),
      emailIdControl: new FormControl(this.data.partyDetails?.emailid || '', Validators.email),
      billingAddressControl: new FormControl(this.data.partyDetails?.billingaddress || ''),
      shippingAddressControl: new FormControl(this.data.partyDetails?.shippingaddress || ''),
      openingBalanceControl: new FormControl(this.data.partyDetails?.openingbalance || 0, Validators.pattern("^[0-9]*$")),
      toPayOrReceiveControl: new FormControl(this.data.partyDetails?.topayorreceive || ''),
      asOfDateControl: new FormControl(this.data.partyDetails?.asofdate
        ? moment(this.data.partyDetails.asofdate).format('YYYY-MM-DD')
        : defaultDate),
      creditLimitControl: new FormControl(this.data.partyDetails?.creditlimit || 0, Validators.pattern("^[0-9]*$")),
      additionalFieldName1Control: new FormControl(this.data.partyDetails?.additionalfieldname1 || ''),
      additionalFieldName2Control: new FormControl(this.data.partyDetails?.additionalfieldname2 || ''),
      additionalFieldName3Control: new FormControl(this.data.partyDetails?.additionalfieldname3 || ''),
      additionalFieldName4Control: new FormControl(this.data.partyDetails?.additionalfieldname4 || ''),
      additionalField1ValueControl: new FormControl(this.data.partyDetails?.additionalfieldname1value || ''),
      additionalField2ValueControl: new FormControl(this.data.partyDetails?.additionalfieldname2value || ''),
      additionalField3ValueControl: new FormControl(this.data.partyDetails?.additionalfieldname3value || ''),
      additionalField4ValueControl: new FormControl(this.data.partyDetails?.additionalfieldname4value || ''),
      additionalField1CheckedControl: new FormControl(this.data.partyDetails?.additionalfield1Checked || false),
      additionalField2CheckedControl: new FormControl(this.data.partyDetails?.additionalfield2Checked || false),
      additionalField3CheckedControl: new FormControl(this.data.partyDetails?.additionalfield3Checked || false),
      additionalField4CheckedControl: new FormControl(this.data.partyDetails?.additionalfield4Checked || false),
    });
  }
  
  populateForm(partyDetails: any) {
    this.addPartyForm.patchValue({
      partyNameControl: this.data.partyName,
      gstControl: partyDetails.gst,
      phoneNumberControl: partyDetails.phonenumber,
      partyGroupControl: partyDetails.partygroup,
      gstTypeControl: partyDetails.gsttype,
      _stateControl: partyDetails._state,
      emailIdControl: partyDetails.emailid,
      billingAddressControl: partyDetails.billingaddress,
      shippingAddressControl: partyDetails.shippingaddress,
      openingBalanceControl: partyDetails.openingbalance,
      toPayOrReceiveControl: partyDetails.topayorreceive,
      asOfDateControl: partyDetails.asofdate
      ? moment(partyDetails.asofdate).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD'),
      creditLimitControl: partyDetails.creditlimit,
      additionalFieldName1Control: partyDetails.additionalfieldname1,
      additionalFieldName2Control: partyDetails.additionalfieldname2,
      additionalFieldName3Control: partyDetails.additionalfieldname3,
      additionalFieldName4Control: partyDetails.additionalfieldname4,
      additionalField1ValueControl: partyDetails.additionalfieldname1value,
      additionalField2ValueControl: partyDetails.additionalfieldname2value,
      additionalField3ValueControl: partyDetails.additionalfieldname3value,
      additionalField4ValueControl: partyDetails.additionalfieldname4value,
    });
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
    this.isCustomLimit = event.target.checked; 
    this.labelText = this.isCustomLimit ? 'Custom Limit' : 'No Limit';

    if (!this.isCustomLimit) {
      this.addPartyForm.get('creditLimitControl')?.setValue(0);
    }
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
  
  submit(isSaveAndNew: boolean) {
    this.ifFormSubmitted = true;
    if(this.addPartyForm.valid) {
    if(this.cs.isUndefineOrNull(this.openingBalance)) {
      this.checkTypeOfPay();
    } 
    this.AddPartyData(this.addPartyForm.value);
    if(isSaveAndNew){
      this.addPartyForm.reset();
    }
    this.addPartyForm.reset()
  } else {
      Swal.fire({
        title: 'Validation Error!',
        text: 'One or more validation error has occured. Please fill all the required fields.',
        confirmButtonText: 'OK',
      })
  }
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddPartyData(body: any): Promise<void> {
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        registeredPhoneNumber: this.registeredPhoneNumber,
        partyName: this.addPartyForm.value.partyNameControl,
        gst: this.addPartyForm.value.gstControl,
        phoneNumber: this.addPartyForm.value.phoneNumberControl,
        partyGroup: this.addPartyForm.value.partyGroupControl,
        gstType: this.addPartyForm.value.gstTypeControl,
        _state: this.addPartyForm.value._stateControl,
        emailId: this.addPartyForm.value.emailIdControl,
        billingAddress: this.addPartyForm.value.billingAddressControl,
        shippingAddress: this.addPartyForm.value.shippingAddressControl,
        openingBalance: this.addPartyForm.value.openingBalanceControl,
        toPayOrReceive: this.addPartyForm.value.toPayOrReceiveControl,
        asOfDate: this.addPartyForm.value.asOfDateControl,
        creditLimit: this.addPartyForm.value.creditLimitControl,
        additionalFieldName1: this.addPartyForm.value.additionalFieldName1Control,
        additionalFieldName2: this.addPartyForm.value.additionalFieldName2Control,
        additionalFieldName3: this.addPartyForm.value.additionalFieldName3Control,
        additionalFieldName4: this.addPartyForm.value.additionalFieldName4Control,
        additionalfieldname1value: this.addPartyForm.value.additionalField1ValueControl,
        additionalfieldname2value: this.addPartyForm.value.additionalField2ValueControl,
        additionalfieldname3value: this.addPartyForm.value.additionalField3ValueControl,
        additionalfieldname4value: this.addPartyForm.value.additionalField4ValueControl,
        typeOfPay: this.typeOfPay,
        oldPartyName: this.addPartyForm.value.partyNameControl,
        isPartyUpdate: this.dataService.isPartyUpdate,
        topayparty: this.topayparty,
        toreceivefromparty: this.toreceivefromparty
      }
      if(this.dataService.isPartyUpdate){
        body.oldPartyName = this.dataService.oldPartyName
      }
      this.api.AddPartyDetails(JSON.stringify(body)).subscribe(res => {
        if (res.status == 'Success') {
          Swal.fire({
            text: res.statusmessage,
            allowOutsideClick:false
          }).then(() => {
            // Code to execute after the popup is closed
            this.dataService.isPartyUpdate = false;
            this.dialogRef.close();
          });
        }
        else if (res.status == 'Failed') {
          Swal.fire({
            text: res.statusmessage,
            confirmButtonText: 'OK',
          })
          console.log("Failed")
        }
        resolve();
      });
    });
  }

  checkTypeOfPay() {
    // Use optional chaining to safely access the control, and provide a default value ('') if it's null
    console.log(this.isOpeningBalance)
    const controlValue = this.addPartyForm.get('toPayOrReceiveControl')?.value;
    if (controlValue === 'PAY') {
      this.typeOfPay = "PAYABLE OPENING BALANCE";
      this.topayparty = this.addPartyForm.value.openingBalanceControl;
    } else if (controlValue === 'RECEIVE') {
      this.typeOfPay = "RECEIVABLE OPENING BALANCE";
      this.toreceivefromparty = this.addPartyForm.value.openingBalanceControl;
    }
  }

  toggleAdditionalField(event: any, field: string) {
    const isChecked = event.target.checked;
    switch (field) {
        case 'additionalField1':
            this.isAdditionalField1Checked = isChecked;
            const nameControl1 = this.addPartyForm.get('additionalFieldName1Control');
            const valueControl1 = this.addPartyForm.get('additionalField1ValueControl');
            
            if (this.isAdditionalField1Checked) {
                if (nameControl1) {
                    nameControl1.setValidators([Validators.required]);
                    if (!nameControl1.value) {
                        nameControl1.setValue('');
                    }
                }
                if (valueControl1) {
                    valueControl1.setValidators([Validators.required]);
                    if (!valueControl1.value) {
                        valueControl1.setValue('');
                    }
                }
            } else {
                if (nameControl1) {
                    nameControl1.clearValidators();
                    nameControl1.setValue('');
                }
                if (valueControl1) {
                    valueControl1.clearValidators();
                    valueControl1.setValue('');
                }
            }
            break;

        case 'additionalField2':
            this.isAdditionalField2Checked = isChecked;
            const nameControl2 = this.addPartyForm.get('additionalFieldName2Control');
            const valueControl2 = this.addPartyForm.get('additionalField2ValueControl');
            
            if (this.isAdditionalField2Checked) {
                if (nameControl2) {
                    nameControl2.setValidators([Validators.required]);
                    if (!nameControl2.value) {
                        nameControl2.setValue('');
                    }
                }
                if (valueControl2) {
                    valueControl2.setValidators([Validators.required]);
                    if (!valueControl2.value) {
                        valueControl2.setValue('');
                    }
                }
            } else {
                if (nameControl2) {
                    nameControl2.clearValidators();
                    nameControl2.setValue('');
                }
                if (valueControl2) {
                    valueControl2.clearValidators();
                    valueControl2.setValue('');
                }
            }
            break;

        case 'additionalField3':
            this.isAdditionalField3Checked = isChecked;
            const nameControl3 = this.addPartyForm.get('additionalFieldName3Control');
            const valueControl3 = this.addPartyForm.get('additionalField3ValueControl');
            
            if (this.isAdditionalField3Checked) {
                if (nameControl3) {
                    nameControl3.setValidators([Validators.required]);
                    if (!nameControl3.value) {
                        nameControl3.setValue('');
                    }
                }
                if (valueControl3) {
                    valueControl3.setValidators([Validators.required]);
                    if (!valueControl3.value) {
                        valueControl3.setValue('');
                    }
                }
            } else {
                if (nameControl3) {
                    nameControl3.clearValidators();
                    nameControl3.setValue('');
                }
                if (valueControl3) {
                    valueControl3.clearValidators();
                    valueControl3.setValue('');
                }
            }
            break;

        case 'additionalField4':
            this.isAdditionalField4Checked = isChecked;
            const nameControl4 = this.addPartyForm.get('additionalFieldName4Control');
            const valueControl4 = this.addPartyForm.get('additionalField4ValueControl');
            
            if (this.isAdditionalField4Checked) {
                if (nameControl4) {
                    nameControl4.setValidators([Validators.required]);
                    if (!nameControl4.value) {
                        nameControl4.setValue('');
                    }
                }
                if (valueControl4) {
                    valueControl4.setValidators([Validators.required]);
                    if (!valueControl4.value) {
                        valueControl4.setValue('');
                    }
                }
            } else {
                if (nameControl4) {
                    nameControl4.clearValidators();
                    nameControl4.setValue('');
                }
                if (valueControl4) {
                    valueControl4.clearValidators();
                    valueControl4.setValue('');
                }
            }
            break;

        default:
            break;
    }

    // Update the validation status
    // this.addPartyForm.get('additionalFieldName1Control')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalField1ValueControl')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalFieldName2Control')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalField2ValueControl')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalFieldName3Control')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalField3ValueControl')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalFieldName4Control')?.updateValueAndValidity();
    // this.addPartyForm.get('additionalField4ValueControl')?.updateValueAndValidity();
}

  updateValue(ev: any) {
    this.toPayOrReceive = ev.target.value;
    this.addPartyForm.get('toPayOrReceiveControl')?.setValue(ev.target.value);
    console.log('Selected option:', this.toPayOrReceive);
    // this.addPartyForm.get('toPayorReceiveControl')?.setValue(value);
  }

  openAddPartyGroupModal() {
    this.dataService.isGroupUpdate = false;
    const dialogRef = this.dialog.open(AddPartyGroupComponent, {
      width: '40%',
      height: '35%', 
    });
    dialogRef.afterClosed().subscribe(result => {
      this.partygroup()
    });
  }

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
