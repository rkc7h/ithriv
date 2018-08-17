import {Component, EventEmitter, HostBinding} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { LoginService } from '../login-service';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { fadeTransition } from '../shared/animations';
import {IThrivForm} from '../shared/IThrivForm';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  animations: [fadeTransition()]
})
export class LoginFormComponent {
  @HostBinding('@fadeTransition')
  title: string;
  login_url = environment.api + '/api/login';
  emailToken: string;
  loginServices: LoginService[] = [];
  errorEmitter = new EventEmitter<string>();
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
    this.loadServices();
    this.iThrivForm.loadForm();
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
    return this.iThrivForm.getFields();
  }

  goLoginService(loginService: LoginService) {
    console.log('loginService', loginService);
    // !!! TO DO: Open web intent associated with given LoginService
    window.location.href = this.login_url;
  }

  goForgotPassword() {
    this.router.navigate(['forgot_password']);
  }

  onSubmit() {
    this.iThrivForm.validate();
    if (!this.loginForm.valid) { return; }

    this.api.login(this.fields['email'].formControl.value,
                    this.fields['password'].formControl.value,
                    this.emailToken).subscribe(token => {
       this.api.openSession(token['token']).subscribe(user => {
         this.router.navigate(['']);
       });
    }, error1 => {
                      if (error1) {
                        this.errorEmitter.emit(error1);
                      } else {
                        this.errorEmitter.emit('An unexpected error occured.  Please contact support.');
                      }
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
