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
  isResourceView = false;
  isNetworkView = false;

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
        this.isResourceView = /^\/resource\//.test(e.url);
        this.isNetworkView = /network$/.test(e.url);
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
    if (this.categoryId) {
      if (network) {
        // Go up the hierarchy to the Level 1 or 0 parent for this category
        this.api.getCategory(parseInt(this.categoryId, 10)).subscribe(c => {
          let catId: number;
          if (c.level === 2) { catId = c.parent.id; }
          if (c.level <= 1) { catId = c.id; }
          this.router.navigate(['category', catId.toString(), 'network']);
        });

      } else {
        // Go up the hierarchy to the Level 0 parent for this category
        this.api.getCategory(parseInt(this.categoryId, 10)).subscribe(c => {
          let catId: number;
          if (c.level === 0) { catId = c.id; }
          if (c.level === 1) { catId = c.parent.id; }
          if (c.level === 2) { catId = c.parent.parent.id; }
          this.router.navigate(['browse', catId.toString()]);
        });
      }
    }
  }
}
