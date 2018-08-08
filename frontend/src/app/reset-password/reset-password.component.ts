import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FormField} from '../form-field';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceApiService} from '../shared/resource-api/resource-api.service';
import {IThrivForm} from '../shared/IThrivForm';

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
    this.route.params.subscribe( params => {
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
      this.api.openSession(auth_token['token']);
      this.router.navigate(['']);
      console.log("We are all done!")
    }, error1 => {
      this.formState = 'form';
      this.errorMessage = error1;
      this.changeDetectorRef.detectChanges();
      console.log("We had a terrible terrible error!")
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }

}
