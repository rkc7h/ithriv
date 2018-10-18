import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { IThrivForm } from '../shared/IThrivForm';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  token: string;
  passwordForm: FormGroup = new FormGroup({});
  formState = 'form';
  errorMessage = '';
  linkFromConfirmEmail = false;
  errorMatcher = new ErrorMatcher();

  fields = {
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
    })
  };
  iThrivForm = new IThrivForm(this.fields, this.passwordForm);

  constructor(
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef) {
    this.route.params.subscribe(params => {
      this.token = params['email_token'];
      this.iThrivForm.loadForm();
    }
    );
  }

  onSubmit() {
    this.iThrivForm.validate();

    if (!this.passwordForm.valid) { return; }

    this.formState = 'submitting';
    this.errorMessage = '';

    this.api.resetPassword(this.fields.password.formControl.value,
      this.token).subscribe(auth_token => {
        this.formState = 'complete';
        this.changeDetectorRef.detectChanges();
        this.api.openSession(auth_token['token']).subscribe(session => {
          const prevUrl = localStorage.getItem('prev_url');
          if (prevUrl) {
            this.router.navigateByUrl(prevUrl).then(() => {
              localStorage.removeItem('prev_url');
            });
          } else {
            // this.router.navigate(['']);
          }
        });
      }, error1 => {
        this.formState = 'form';
        this.errorMessage = error1;
        this.changeDetectorRef.detectChanges();
      });
  }

  onCancel() {
    this.router.navigate(['']);
  }

}
