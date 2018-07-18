import { Component, HostBinding } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivationEnd } from '@angular/router';
import { environment } from '../../environments/environment';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [routerTransition()],
})

export class HeaderComponent {
  @HostBinding('@routerTransition')
  title: string;
  isHome = false;
  login_url = environment.api + '/api/login';
  hideHeader = false;

  constructor(
    private router: Router,
    private api: ResourceApiService
  ) {
    this.router.events.subscribe((e) => {
      if (e instanceof ActivationStart || e instanceof ActivationEnd) {
        if (e.snapshot && e.snapshot.data) {
          const data = e.snapshot.data;
          this.hideHeader = !!data.hideHeader;
          this.title = data.title;
        }
      }

      if (e instanceof NavigationEnd) {
        this.isHome = ['/', '/search'].includes(e.url);
      }
    });
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  goLogin($event) {
    $event.preventDefault();
    this.router.navigate(['login']);
    // window.location.href = this.login_url;
  }

  goProfile($event) {
    $event.preventDefault();
    this.router.navigate(['profile']);
    // window.location.href = this.login_url;
  }
  goRegister($event) {
    $event.preventDefault();
    this.router.navigate(['register']);
    // window.location.href = this.login_url;
  }

  goLogout($event) {
    $event.preventDefault();
    this.api.closeSession();
  }

  getSession() {
    return this.api.session;
  }

}
