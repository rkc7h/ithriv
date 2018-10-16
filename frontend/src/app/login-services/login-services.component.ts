import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Institution } from '../institution';
import { LoginService } from '../login-service';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-login-services',
  templateUrl: './login-services.component.html',
  styleUrls: ['./login-services.component.scss']
})
export class LoginServicesComponent implements OnInit {
  loginServices: LoginService[] = [];
  loginUrl = environment.api + '/api/login';
  institution: Institution;
  selectedTabIndex = 0;

  constructor(
    private api: ResourceApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.selectedTabIndex = (this.route.routeConfig.path === 'register') ? 1 : 0;
  }

  ngOnInit() {
    this.loadServices();
  }

  goNetworkBrowse() {
    const viewPrefs = this.api.getViewPreferences();
    const isNetworkView = viewPrefs && viewPrefs.hasOwnProperty('isNetworkView') ? viewPrefs.isNetworkView : true;

    if (isNetworkView) {
      this.router.navigate(['network']);
    } else {
      this.router.navigate(['browse']);
    }
  }

  getInstitution() {
    if (sessionStorage.getItem('institution_id')) {
      this.api.getInstitution(parseInt(sessionStorage.getItem('institution_id'), 10)).subscribe(
        (inst) => {
          this.institution = inst;
        }
      );
    }
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
    if (this.router.url !== '/login') {
      const prevUrl = this.router.url;
      localStorage.setItem('prev_url', prevUrl);
    }

    if (loginService.url) {
      window.location.href = loginService.url;
    } else {
      this.api.getInstitutions().subscribe(institutions => {
        for (const id in institutions) {
          if (institutions.hasOwnProperty(id)) {
            const inst = institutions[id];
            if (inst.name === loginService.name) {
              sessionStorage.setItem('institution_id', inst.id.toString());
              sessionStorage.setItem('institution_name', loginService.name);
              this.getInstitution();
            }
          }
        }
      });
    }
  }
}
