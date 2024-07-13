import { Token } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginRequest } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showOtpInput:boolean = true;
  details:any;

  constructor(private api: ApiService, private router: Router) { };

  ngOnInit(): void {
    localStorage.clear();
    this.loginForm = new FormGroup({
      phonenumber: new FormControl(""),
      password: new FormControl(""),
      otp: new FormControl(""),
    });
  }

  handleLoginFormSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.getRawValue() as LoginRequest;
      this.api.AuthenticateUser(formValue).subscribe((res) => {
        if (res.status.toLowerCase().trim() === "success") {
          const AuthToken = {
            "token": res.accessToken,
            "expiryDate": res.expiryDate
          }
          localStorage.setItem("phonenumber", JSON.stringify(formValue.phonenumber));
          localStorage.setItem("AuthToken", JSON.stringify(AuthToken));
          this.router.navigateByUrl("/businessinfo");
        }
      });
    }
  }

  GetOtp(){
    this.showOtpInput = false
    if (this.loginForm.valid){
      const formValue = this.loginForm.getRawValue() as LoginRequest;
      const phoneNumber = String(formValue.phonenumber);
      this.api.GetOtp(phoneNumber).subscribe((res:any) => {
        if(res.Status){
          this.details = res.Details
          console.log(this.details)
        }
      })
    }
  }

  handleOtpFormSubmit(){
    if (this.loginForm.valid){
      const formValue = this.loginForm.getRawValue() as LoginRequest;
      const phonenumber = String(formValue.phonenumber);
      let body = {
        SessionId: this.details,
        Otp: formValue.otp,
        registeredphonenumber: phonenumber
      }
      this.api.VerifyOtp(body).subscribe((res:any) => {
        if (res.status.toLowerCase().trim() === "success") {
          const AuthToken = {
            "token": res.accessToken,
            "expiryDate": res.expiryDate
          }
          localStorage.setItem("phonenumber", JSON.stringify(formValue.phonenumber));
          localStorage.setItem("AuthToken", JSON.stringify(AuthToken));
          this.router.navigateByUrl("/businessinfo");
        }
      });
    }
  }

  setflagvalue(val:any){
    if(val=='otp'){
      this.showOtpInput = false
    } else if (val == 'password'){
      this.showOtpInput = true
    }
  }
}
