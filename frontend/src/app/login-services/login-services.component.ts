import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { ResourceApiService } from "../shared/resource-api/resource-api.service";
import { LoginService } from '../login-service';

@Component({
  selector: 'app-login-services',
  templateUrl: './login-services.component.html',
  styleUrls: ['./login-services.component.scss']
})
export class LoginServicesComponent implements OnInit {
  loginServices: LoginService[] = [];
  loginUrl = environment.api + '/api/login';

  constructor(
    private api: ResourceApiService
    ) {
    this.loadServices();
  }

  ngOnInit() {
  }

  loadServices() {
    const services = [
      { id: 1, color: 'orange', name: 'UVA NetBadge', image: '/assets/institutions/UVA.png', url: this.loginUrl },
      { id: 2, color: 'navy', name: 'Carilion', image: '/assets/institutions/Carilion.png' },
      { id: 3, color: 'purple', name: 'Virginia Tech', image: '/assets/institutions/Virginia Tech.png', url: this.loginUrl },
      { id: 4, color: 'blue', name: 'Inova', image: '/assets/institutions/Inova.png' },
    ];
    this.loginServices = services.map(s => new LoginService(s));
  }

  goLoginService(loginService: LoginService) {
    console.log('loginService', loginService);
    if (loginService.url) {
      window.location.href = loginService.url;
    } else {
      this.api.getInstitutions().subscribe(institutions => {
        for (const id in institutions) {
          if (institutions.hasOwnProperty(id)) {
            const inst = institutions[id];
            if (inst.name == loginService.name) {
              sessionStorage.setItem('institution_id', inst.id.toString());
              sessionStorage.setItem('institution_name', loginService.name);
              console.log('setting Name', loginService.name);
              console.log('setting Id', inst.id.toString());
            }
          }
        }
      });
    }
  }
}
