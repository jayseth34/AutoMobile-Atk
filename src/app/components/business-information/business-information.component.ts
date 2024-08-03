import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-information',
  templateUrl: './business-information.component.html',
  styleUrls: ['./business-information.component.css']
})
export class BusinessInformationComponent {
  showBusinessDetails: boolean = false;
  businessInfoGroup: UntypedFormGroup;
  registeredphonenumber: any;

  constructor(public api: ApiService, public cs: CommonService){ }

  ngOnInit(){
    this.registeredphonenumber = parseInt(
      JSON.parse(localStorage.getItem('phonenumber') as string)
    );

    this.api.getBusinessInfo(this.registeredphonenumber).subscribe(res => {
      debugger
      if(res.status == 'SUCCESS' && !this.cs.isUndefineOrNull(res.businessInfo)){
        this.businessInfoGroup.setValue({
          businessNameControl: res.businessInfo.businessName || '',
          gstinControl: res.businessInfo.gstin || '',
          phoneNumberControl: res.businessInfo.phoneNumber || '',
          emailIdControl: res.businessInfo.emailId || '',
          businessAddressControl: res.businessInfo.businessAddress || '',
          businessTypeControl: res.businessInfo.businessType || '',
          businessCategoryControl: res.businessInfo.businessCategory || '',
          pincodeControl: res.businessInfo.pincode || '',
          stateControl: res.businessInfo.state || '',
          businessDescriptionControl: res.businessInfo.businessDescription || ''
        }, { emitEvent: false });
      

      } else {
        console.log("BI FAIL")
      }
    })

    this.businessInfoGroup = new UntypedFormGroup({
      businessNameControl: new UntypedFormControl('',[Validators.required]),
      gstinControl: new UntypedFormControl('', ),
      phoneNumberControl: new UntypedFormControl('',[Validators.pattern(/^\d{10}$/)] ),
      emailIdControl: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)] ),
      businessAddressControl: new UntypedFormControl('', ),
      businessTypeControl: new UntypedFormControl('', ),
      businessCategoryControl: new UntypedFormControl('', ),
      pincodeControl: new UntypedFormControl('',[Validators.pattern(/^\d{6}$/)] ),
      stateControl: new UntypedFormControl('', ),
      businessDescriptionControl: new UntypedFormControl('', ),
    });
  }

  toggleBusinessDetails() {
    this.showBusinessDetails = !this.showBusinessDetails;
  }

  addBusinessInfoData(body: any): Promise<void> {
    console.log("BUSINESS INFO: ", this.businessInfoGroup.value);
    return new Promise((resolve) => {
      let body = {
        registeredphonenumber: this.registeredphonenumber,
        businessName: this.businessNameControl?.value,
        gstin: this.gstinControl?.value,
        phoneNumber: this.phoneNumberControl?.value ? parseInt(this.phoneNumberControl?.value, 10) : 0,
        emailId: this.emailIdControl?.value,
        businessAddress: this.businessAddressControl?.value,
        businessType: this.businessTypeControl?.value,
        businessCategory: this.businessCategoryControl?.value,
        pincode: this.pincodeControl?.value ? parseInt(this.pincodeControl?.value, 10) : 0,
        state: this.stateControl?.value,
        businessDescription: this.businessDescriptionControl?.value,
    };    

      this.api.addBusinessInfo(JSON.stringify(body)).subscribe(res => {
        if (res.status == 'Success') {
          Swal.fire({
            text: res.statusmsg,
            confirmButtonText: 'OK',
          })
        }
        else{
           Swal.fire({
            text: res.statusmsg,
            confirmButtonText: 'OK',
          })
        }
        resolve();
      });
    });
  }

  submit() {
    if(this.businessInfoGroup.valid) {
      this.addBusinessInfoData(this.businessInfoGroup.value);
      console.log("BUSINESS INFO: ", this.businessInfoGroup.value)
    } 
    else{
      Swal.fire({
        title: 'Validation Error!',
        text: 'One or more validation error has occured. Please fill all the required fields.',
        confirmButtonText: 'OK',
      })
    }
  }

  get businessNameControl() { return this.businessInfoGroup.get('businessNameControl'); }
  get gstinControl() { return this.businessInfoGroup.get('gstinControl'); }
  get phoneNumberControl() { return this.businessInfoGroup.get('phoneNumberControl'); }
  get emailIdControl() { return this.businessInfoGroup.get('emailIdControl'); }
  get businessAddressControl() { return this.businessInfoGroup.get('businessAddressControl'); }
  get businessTypeControl() { return this.businessInfoGroup.get('businessTypeControl'); }
  get businessCategoryControl() { return this.businessInfoGroup.get('businessCategoryControl'); }
  get pincodeControl() { return this.businessInfoGroup.get('pincodeControl'); }
  get stateControl() { return this.businessInfoGroup.get('stateControl'); }
  get businessDescriptionControl() { return this.businessInfoGroup.get('businessDescriptionControl'); }
  
}
