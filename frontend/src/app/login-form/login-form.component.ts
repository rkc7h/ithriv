import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '../../../node_modules/@angular/forms';
import { Router } from '../../../node_modules/@angular/router';
import { environment } from '../../environments/environment.staging';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { LoginService } from '../login-service';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  animations: [routerTransition()]
})
export class LoginFormComponent implements OnInit {
  @HostBinding('@routerTransition')
  login_url = environment.api + '/api/login';
  title: string;
  loginServices: LoginService[] = [];
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

  constructor(
    private api: ResourceApiService,
    private router: Router
  ) {
    this.loadServices();
    this.loadForm();
  }

  ngOnInit() {
  }

  loadServices() {

    // !!! TO DO: Load available login services from the API
    const services = [
      { id: 1, color: 'orange', name: 'UVA NetBadge', image: '/assets/institutions/UVA.png' },
      { id: 2, color: 'navy', name: 'Carilion', image: '/assets/institutions/Carilion.png' },
      { id: 3, color: 'purple', name: 'Virginia Tech', image: '/assets/institutions/Virginia Tech.png' },
    ];

    this.loginServices = services.map(s => new LoginService(s));
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

        this.loginForm.addControl(fieldName, field.formControl);
      }
    }
  }

  goLoginService(loginService: LoginService) {
    console.log('loginService', loginService);

    // !!! TO DO: Open web intent associated with given LoginService
    window.location.href = this.login_url;
  }

  goForgotPassword() {
    console.log('goForgotPassword');
    this.router.navigate(['forgot_password']);
  }

  goRegister() {
    console.log('goRegister');
    this.router.navigate(['register']);
  }

  onSubmit() {
    window.location.href = this.login_url;
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
