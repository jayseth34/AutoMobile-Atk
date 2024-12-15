import { Token } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginRequest } from 'src/app/models';
import { ApiService } from 'src/app/services/api.service';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showOtpInput:boolean = true;
  details:any;
  isvalid: boolean = false;

  constructor(private api: ApiService, private router: Router, public dataService: DataService) { };

  ngOnInit(): void {
    localStorage.clear();
    this.loginForm = new FormGroup({
      phonenumber: new FormControl(""),
      password: new FormControl(""),
      otp: new FormControl(""),
    });
    this.dataService.isLogin = true;
  }

  handleLoginFormSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.getRawValue() as LoginRequest;
      this.api.AuthenticateUser(formValue).subscribe((res) => {
        if (res.status.toLowerCase().trim() === "success") {
          this.dataService.isLogin = false;
          const AuthToken = {
            "token": res.accessToken,
            "expiryDate": res.expiryDate
          }
          localStorage.setItem("phonenumber", JSON.stringify(formValue.phonenumber));
          localStorage.setItem("AuthToken", JSON.stringify(AuthToken));
          localStorage.setItem("planType", JSON.stringify(res.plantype))
          localStorage.setItem("expiryDate", JSON.stringify(res.expiryDate));
          this.router.navigateByUrl("/dashboard");
        } else if (res.status.toLowerCase().trim() === "failed"){
          this.isvalid = true
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
        if(res.status == 5){
          this.details = JSON.parse(res.result)
          console.log(this.details)
        } else {
          Swal.fire({text: "OTP could not be sent kindly try again!"})
        }
      })
    }
  }

  handleOtpFormSubmit(){
    if (this.loginForm.valid){
      const formValue = this.loginForm.getRawValue() as LoginRequest;
      const phonenumber = String(formValue.phonenumber);
      let body = {
        SessionId: this.details.Details,
        Otp: formValue.otp,
        registeredphonenumber: phonenumber
      }
      this.api.VerifyOtp(body).subscribe((res:any) => {
        if (res.status.toLowerCase().trim() === "success") {
          this.dataService.isLogin = false;
          const AuthToken = {
            "token": res.accessToken,
            "expiryDate": res.expiryDate
          }
          localStorage.setItem("phonenumber", JSON.stringify(formValue.phonenumber));
          localStorage.setItem("AuthToken", JSON.stringify(AuthToken));
          localStorage.setItem("planType", JSON.stringify(res.plantype))
          localStorage.setItem("expiryDate", JSON.stringify(res.expiryDate));
          this.router.navigateByUrl("/dashboard");
        } else {
          Swal.fire({text: "OTP did not match!"})
        }
      });
    }
  }

  setflagvalue(val:any){
    this.isvalid = false
    if(val=='otp'){
      this.showOtpInput = false
    } else if (val == 'password'){
      this.showOtpInput = true
    }
  }

  setregisterlogin(val:any){
    if(val == "register"){
      this.router.navigateByUrl("/register");
    }
  }
}
