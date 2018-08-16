import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { User } from '../user';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  login_url = environment.api + '/api/login';
  error: string;
  errorMatcher = new ErrorMatcher();
  profileForm: FormGroup = new FormGroup({});
  user: User;
  errorMessage = '';
  fields = {
    display_name: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Display Name',
      type: 'text',
    }),
    email: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Email',
      type: 'email',
    }),
    institution_id: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Home Institution',
      type: 'select',
      apiSource: 'getInstitutions',
      fieldsetId: 'institution_prefs',
      fieldsetLabel: 'Institutions'
    }),
    password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Current Password',
      type: 'password',
    }),
  };

  constructor(
    private api: ResourceApiService,
    private router: Router
  ) {
    this.loadForm();
    this.user = { id: null, display_name: this.fields.display_name.formControl.value,
      email: this.fields.email.formControl.value, institution_id: this.fields.institution_id.formControl.value,
      password: this.fields.password.formControl.value, role: 'User' };
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
