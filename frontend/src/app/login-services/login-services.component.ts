import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Institution } from '../institution';
import { LoginService } from '../login-service';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-login-services',
  templateUrl: './login-services.component.html',
  styleUrls: ['./login-services.component.scss'],
  animations: [fadeTransition()]
})
export class LoginServicesComponent implements OnInit {
  loginServices: LoginService[] = [];
  loginUrl = environment.api + '/api/login';
  institution: Institution;
  selectedTabIndex = 0;

  @HostBinding('@fadeTransition')
  dataLoaded = false;

  constructor(
    private api: ResourceApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.selectedTabIndex = (this.route.routeConfig.path === 'register') ? 1 : 0;
    this.loadServices();

    this.route.queryParams.subscribe(params => {
      if (params.hasOwnProperty('institutionId')) {
        const instituttionId = parseInt(params['institutionId'], 10);
        this.api.getInstitution(instituttionId).subscribe(institution => {
          this.institution = institution;
          sessionStorage.setItem('institution_name', institution.name);
        });
      }
    });
  }

  ngOnInit() { }

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
      { id: null, color: 'orange', name: 'UVA', image: '/assets/institutions/UVA.png', url: this.loginUrl },
      { id: null, color: 'navy', name: 'Carilion', image: '/assets/institutions/Carilion.png' },
      { id: null, color: 'purple', name: 'Virginia Tech', image: '/assets/institutions/Virginia Tech.png', url: this.loginUrl },
      { id: null, color: 'blue', name: 'Inova', image: '/assets/institutions/Inova.png' },
    ];

    this.api.getInstitutions().subscribe(institutions => {
      institutions.forEach(i => services.forEach(s => {
        if (i.name === s.name) {
          s.id = i.id;
          this.loginServices.push(new LoginService(s));
        }
      }));

      this.dataLoaded = this.loginServices.length > 0;
    });
  }

  goLoginService(loginService: LoginService) {
    const institutionId = loginService.id.toString();
    sessionStorage.setItem('institution_id', institutionId);

    const onLoginScreen = /^\/login/.test(this.router.url);

    if (!onLoginScreen) {
      const prevUrl = this.router.url;
      localStorage.setItem('prev_url', prevUrl);
    }

    if (loginService.url) {
      window.location.href = loginService.url;
    } else {
      this.router.navigate(['login'], { queryParams: { institutionId: institutionId } });
    }
  }
}
