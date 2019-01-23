import { Component, EventEmitter, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { fadeTransition } from '../shared/animations';
import { IThrivForm } from '../shared/IThrivForm';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  animations: [fadeTransition()]
})
export class LoginFormComponent {
  @HostBinding('@fadeTransition')
  submitting = false;
  title: string;
  emailToken: string;
  error: string;
  errorMatcher = new ErrorMatcher();
  loginForm: FormGroup = new FormGroup({});
  fields = {
    email: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Email',
      type: 'text',
    }),
    password: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Password',
      type: 'password',
    }),
  };
  iThrivForm = new IThrivForm(this.fields, this.loginForm);

  constructor(
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      if ('email_token' in params) {
        this.emailToken = params['email_token'];
      }
    });
    this.iThrivForm.loadForm();
  }

  getFields() {
    return this.iThrivForm.getFields();
  }

  goForgotPassword() {
    this.router.navigate(['forgot_password']);
  }

  onKeydown($event: KeyboardEvent) {
    if ($event.keyCode === 13) {
      this.onSubmit();
    }
  }

  onSubmit() {
    this.submitting = true;
    this.iThrivForm.validate();
    if (!this.loginForm.valid) {
      this.submitting = false;
      return;
    }

    this.api.login(
      this.fields['email'].formControl.value,
      this.fields['password'].formControl.value,
      this.emailToken
    ).subscribe(token => {
      this.api.openSession(token['token']).subscribe(user => {
        const prevUrl = localStorage.getItem('prev_url');
        if (prevUrl) {
          this.router.navigateByUrl(prevUrl).then(() => {
            localStorage.removeItem('prev_url');
          });
        } else {
          this.router.navigate(['']);
        }
      });
    }, error1 => {
      this.submitting = false;
      if (error1) {
        this.error = error1;
        } else {
        this.error = 'An unexpected error occurred.  Please contact support.';
      }
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
