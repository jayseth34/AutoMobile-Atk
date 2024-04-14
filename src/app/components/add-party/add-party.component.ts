import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, AbstractControl, Validators } from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-add-party',
  templateUrl: './add-party.component.html',
  styleUrls: ['./add-party.component.css']
})
export class AddPartyComponent {
  selectedTab: string = 'gstAndAddress'; // Initially select the 'address' tab
  isOpeningBalance: boolean = false;
  isShippingAddressEnabled: boolean = true;
  isCustomLimit: boolean = false;
  customLimit: any; 
  addPartyData = {
    partyName: "",
    gst: "",
    phoneNumber: "",
    partyGroup: "",
    gstType: "",
    _state: "",
    emailId: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    toPayOrReceive: "",
    asOfDate: "",
    creditLimit: "",
    additionalFieldName1:"",
    additionalFieldName2: "",
    additionalFieldName3: "",
    additionalFieldName4: ""
  }
  labelText: string = 'No Limit';

  addPartyForm: UntypedFormGroup;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.addPartyForm = new UntypedFormGroup({
      partyNameControl: new UntypedFormControl('',),
      gstControl: new UntypedFormControl('',),
      phoneNumberControl: new UntypedFormControl('',),
      partyGroupControl: new UntypedFormControl('',),
      gstTypeControl: new UntypedFormControl('',),
      _stateControl: new UntypedFormControl('',),
      emailIdControl: new UntypedFormControl('',),
      billingAddressControl: new UntypedFormControl('',),
      shippingAddressControl: new UntypedFormControl('',),
      openingBalanceControl: new UntypedFormControl('',),
      toPayOrReceiveControl: new UntypedFormControl('',),
      asOfDateControl: new UntypedFormControl('',),
      creditLimitControl: new UntypedFormControl('',),
      additionalField1Control: new UntypedFormControl('',),
      additionalField2Control: new UntypedFormControl('',),
      additionalField3Control: new UntypedFormControl('',),
      additionalField4Control: new UntypedFormControl('',),
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  toggleShippingAddress() {
    this.isShippingAddressEnabled = !this.isShippingAddressEnabled;
  }

  /////////// improvement required
  updateLabel(event: any) {
    this.labelText = event.target.checked ? 'Custom limit' : 'No limit';
    this.isCustomLimit = event.target.checked; 
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

  submit() {
    debugger;
    this.AddPartyData();
  }

  isPayRecieve(ev:any) {
    if(ev.length == 0){
      this.isOpeningBalance = false
    } else{
      this.isOpeningBalance = true
    }
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  AddPartyData(): Promise<void> {
    debugger
    console.log("BEFore return");
    return new Promise((resolve) => {
      console.log("after return");
      let body = {
        partyName: this.addPartyData.partyName,
        gst: this.addPartyData.gst,
        phoneNumber: this.addPartyData.phoneNumber,
        partyGroup: this.addPartyData.partyGroup,
        gstType: this.addPartyData.gstType,
        _state: this.addPartyData._state,
        emailId: this.addPartyData.emailId,
        billingAddress: this.addPartyData.billingAddress,
        shipppingAddress: this.addPartyData.shippingAddress,
        openingBalance: this.addPartyData.openingBalance,
        toPayOrReceive: this.addPartyData.toPayOrReceive,
        asOfDate:this.addPartyData.asOfDate,
        creditLimit: this.addPartyData.creditLimit,
        additionalFieldName1: this.addPartyData.additionalFieldName1,
        additionalFieldName2: this.addPartyData.additionalFieldName2,
        additionalFieldName3: this.addPartyData.additionalFieldName3,
        additionalFieldName4: this.addPartyData.additionalFieldName4
      }
      // console.log(body.)
      debugger;
      this.api.getAddParty(JSON.stringify(body)).pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (res == "Success") {
          console.log("Success")
        }
        else{
          console.log("Failed")
        }
        resolve();
      });
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

}
