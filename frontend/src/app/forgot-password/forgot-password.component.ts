import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { IThrivForm } from '../shared/IThrivForm';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  errorMessage: string;
  errorMatcher = new ErrorMatcher();
  forgotPasswordForm: FormGroup = new FormGroup({});
  formStatus = 'form';
  fields = {
    email: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Email',
      type: 'email',
    }),
  };
  iThrivForm = new IThrivForm(this.fields, this.forgotPasswordForm);

  constructor(private router: Router, private api: ResourceApiService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.iThrivForm.loadForm();
  }

  ngOnInit() {
  }

  getFields() {
    return this.iThrivForm.getFields();
  }

  onKeydown($event: KeyboardEvent) {
    if ($event.keyCode === 13) {
      this.onSubmit();
    }
  }

  onSubmit() {
    this.iThrivForm.validate();
    if (!this.forgotPasswordForm.valid) { return; }
    this.formStatus = 'submitting';
    this.api.sendResetPasswordEmail(this.fields.email.formControl.value).subscribe(e => {
      this.formStatus = 'complete';
    }, error1 => {
      if (error1) {
        this.errorMessage = error1;
      } else {
        this.errorMessage = 'We encountered an error resetting your password.  Please contact support.';
      }
      this.formStatus = 'form';
      this.changeDetectorRef.detectChanges();
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
