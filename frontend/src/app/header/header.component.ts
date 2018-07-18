import {environment} from 'environments/environment';
import { Component, HostBinding } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { routerTransition } from '../shared/router.animations';
import {ResourceApiService} from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [routerTransition()],
})

export class HeaderComponent {
  @HostBinding('@routerTransition')
  title = 'app';
  isHome = false;
  login_url = environment.api + '/api/login';

  constructor(private router: Router,
              private api: ResourceApiService) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.isHome = ['/', '/search'].includes(val.url);
      }
    });
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  goLogin() {
    window.location.href = this.login_url;
  }

  goLogout() {
    this.api.closeSession();
  }

  getSession() {
    return this.api.session;
  }

}
