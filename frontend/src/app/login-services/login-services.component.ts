import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginService } from '../login-service';

@Component({
  selector: 'app-login-services',
  templateUrl: './login-services.component.html',
  styleUrls: ['./login-services.component.scss']
})
export class LoginServicesComponent implements OnInit {
  loginServices: LoginService[] = [];
  loginUrl = environment.api + '/api/login';

  constructor() {
    this.loadServices();
  }

  ngOnInit() {
  }

  // !!! TO DO: Load available login services from the API
  loadServices() {
    const services = [
      { id: 1, color: 'orange', name: 'UVA NetBadge', image: '/assets/institutions/UVA.png' },
      { id: 2, color: 'navy', name: 'Carilion', image: '/assets/institutions/Carilion.png' },
      { id: 3, color: 'purple', name: 'Virginia Tech', image: '/assets/institutions/Virginia Tech.png' },
    ];

    this.loginServices = services.map(s => new LoginService(s));
  }

  goLoginService(loginService: LoginService) {
    console.log('loginService', loginService);
    // !!! TO DO: Open web intent associated with given LoginService
    window.location.href = this.loginUrl;
  }

}
