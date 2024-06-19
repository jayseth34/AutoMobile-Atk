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

  constructor(private api: ApiService, private router: Router) { };

  ngOnInit(): void {
    localStorage.clear();
    this.loginForm = new FormGroup({
      "phonenumber": new FormControl(""),
      "password": new FormControl(""),
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
}
