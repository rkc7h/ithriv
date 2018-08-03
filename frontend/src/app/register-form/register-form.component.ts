import {Component, EventEmitter, HostBinding, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { User } from '../user';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  animations: [routerTransition()]
})
export class RegisterFormComponent implements OnInit {
  @HostBinding('@routerTransition')
  title: string;
  login_url = environment.api + '/api/register';
  errorEmitter = new EventEmitter<string>();
  errorMatcher = new ErrorMatcher();
  user: User;
  registerForm: FormGroup = new FormGroup({});

  // Form Fields
  fields = {
    display_name: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Your Name',
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

  constructor(
    private api: ResourceApiService,
    private router: Router
  ) {
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

        this.user = { id: null, display_name: this.fields.display_name.formControl.value,
          email: this.fields.email.formControl.value,
          password: this.fields.password.formControl.value };
        this.registerForm.addControl(fieldName, field.formControl);
      }
    }
  }

  onSubmit() {
    this.validate();

    if (this.registerForm.valid) {

      for (const fieldName in this.fields) {
        if (this.fields[fieldName].formControl) {
          this.user[fieldName] = this.fields[fieldName].formControl.value;
        }
      }

      this.api.addUser(this.user).subscribe(u => {
        this.user = u;
        this.api.login(this.fields.email.formControl.value,
          this.fields.password.formControl.value).subscribe(token => {
          this.api.openSession(token['token']);
          this.router.navigate(['']);
        });
      }, error1 => {
        this.errorEmitter.emit(error1);
      });


    } else {
      console.log('FORM NOT VALID');
    }
  }

  validate() {
    for (const key in this.registerForm.controls) {
      if (this.registerForm.controls.hasOwnProperty(key)) {
        const control = this.registerForm.controls[key];
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
