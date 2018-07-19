import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '../../../node_modules/@angular/forms';
import { Router } from '../../../node_modules/@angular/router';
import { environment } from '../../environments/environment.staging';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  login_url = environment.api + '/api/login';
  error: string;
  errorMatcher = new ErrorMatcher();
  registerForm: FormGroup = new FormGroup({});
  fields = {
    first_name: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'First Name',
      type: 'text',
    }),
    last_name: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Last Name',
      type: 'text',
    }),
    email: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Email',
      type: 'email',
    }),
    password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Password',
      type: 'password',
    }),
    confirm_password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Confirm Password',
      type: 'password',
    }),
  };

  constructor(private router: Router) {
    this.loadForm();
  }

  ngOnInit() {
  }

  getFields() {
    const fields = [];

    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        fields.push(this.fields[fieldName]);
      }
    }

    return fields;
  }

  loadForm() {
    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        const field = this.fields[fieldName];
        const validators = [];

        if (field.required) {
          validators.push(Validators.required);
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        this.registerForm.addControl(fieldName, field.formControl);
      }
    }
  }

  onSubmit() {
    window.location.href = this.login_url;
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
