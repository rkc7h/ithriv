import {ChangeDetectorRef, Component, EventEmitter, HostBinding, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { User } from '../user';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import {ValidatePasswordsMatch} from '../shared/validators/password_match.validator';

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
  errorMatcher = new ErrorMatcher();
  user: User;
  registerForm: FormGroup = new FormGroup({});
  registerState = 'form';
  errorMessage = '';
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
      minLength: 10
    }),
    password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Password',
      type: 'password',
      minLength: 8
    }),
    confirm_password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Confirm Password',
      type: 'password',
      minLength: 8,
      passwordsMatch: true
    }),
  };

  constructor(
    private api: ResourceApiService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
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

        if (field.minLength) {
          validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength) {
          validators.push(Validators.maxLength(field.maxLength));
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        if (field.passwordsMatch) {
          validators.push(ValidatePasswordsMatch);
        }

        field.formControl.setValidators(validators);
        this.user = { id: null, display_name: this.fields.display_name.formControl.value,
          email: this.fields.email.formControl.value,
          password: this.fields.password.formControl.value };
        this.registerForm.addControl(fieldName, field.formControl);
      }
    }
  }

  onSubmit() {
    this.validate();

    if (!this.registerForm.valid) { return; }

    this.registerState = 'submitting';
    this.errorMessage = '';
    console.log('Register state is submitting');

    for (const fieldName in this.fields) {
      if (this.fields[fieldName].formControl) {
        this.user[fieldName] = this.fields[fieldName].formControl.value;
      }
    }

    this.api.addUser(this.user).subscribe(u => {
      this.user = u;
      this.registerState = 'wait_for_email';
      this.changeDetectorRef.detectChanges();
      console.log('Register state is wait_for_email');
    }, error1 => {
      this.registerState = 'form';
      this.errorMessage = error1;
      this.changeDetectorRef.detectChanges();
      console.log('Register state is form?' + this.registerState);
    });
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
    this.registerState = 'form';
    this.changeDetectorRef.detectChanges();
  }

  goHome() {
    this.router.navigate(['']);
    this.registerState = 'form';
    this.changeDetectorRef.detectChanges();
  }

}
