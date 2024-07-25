import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        phonenumber: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
        state: ['', Validators.required],
        address: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('password')?.value ===
      formGroup.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  handleRegisterFormSubmit(): void {
    if (this.registerForm.valid) {
      this.api.registerUser(this.registerForm.value).subscribe(
        (response: any) => {
          if (response.stat === 'Success') {
            Swal.fire({
              text: 'User Created Successfully',
              confirmButtonText: 'Go To Login',
              allowOutsideClick: false,
            }).then((res: any) => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              text: response.status,
              allowOutsideClick: false,
            });
          }
        },
        (error: any) => {
          Swal.fire({
            text: 'An error occurred. Please try again.',
            allowOutsideClick: false,
          });
        }
      );
    }
  }
}
