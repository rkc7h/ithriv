import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.staging';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  login_url = environment.api + '/api/login';
  error: string;
  errorMatcher = new ErrorMatcher();
  profileForm: FormGroup = new FormGroup({});
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
      placeholder: 'Current Password',
      type: 'password',
    }),
    confirm_password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'New Password',
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

        this.profileForm.addControl(fieldName, field.formControl);
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
