import { Component, HostBinding } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivationEnd, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [routerTransition()]
})

export class HeaderComponent {
  @HostBinding('@routerTransition')
  title: string;
  isHome = false;
  login_url = environment.api + '/api/login';
  hideHeader = false;
  categoryId: string;

  constructor(
    private router: Router,
    private api: ResourceApiService,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe((e) => {
      if (e instanceof ActivationStart || e instanceof ActivationEnd) {
        if (e.snapshot && e.snapshot.data) {
          this.categoryId = e.snapshot && e.snapshot.params && e.snapshot.params.category;

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
  }

  goProfile($event) {
    $event.preventDefault();
    this.router.navigate(['profile']);
  }
  goRegister($event) {
    $event.preventDefault();
    this.router.navigate(['register']);
  }

  goLogout($event) {
    $event.preventDefault();
    this.api.closeSession(session => {
      this.router.navigate(['']);
    });
  }

  getSession() {
    return this.api.session;
  }

  viewMode(network = false) {
    console.log('\n\n=== viewMode ===');
    console.log('category', this.categoryId);

    const mode = network ? 'network' : undefined;

    if (this.categoryId) {
      if (network) {
        this.router.navigate(['category', this.categoryId, mode]);
      }
    }
  }
}
