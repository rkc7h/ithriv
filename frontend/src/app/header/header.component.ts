import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivationStart, NavigationEnd, Router, ActivationEnd, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { fadeTransition } from '../shared/animations';
import { User } from '../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeTransition()]
})

export class HeaderComponent implements OnInit {
  @HostBinding('@fadeTransition')
  title: string;
  isHome = false;
  login_url = environment.api + '/api/login';
  hideHeader = false;
  categoryId: string;
  isResourceView = false;
  isNetworkView: boolean;
  session: User;

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
      }
    });

    this.isNetworkView = this.getIsNetworkView();
  }

  ngOnInit() {
    this.api.getSession().subscribe(user => {
      this.session = user;
    }, error1 => {
      this.session = null;
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

  goUserAdmin($event) {
    $event.preventDefault();
    this.router.navigate(['admin/users']);
  }

  goSearch($event) {
    $event.preventDefault();
    this.router.navigate(['search']);
  }

  goLogout($event) {
    $event.preventDefault();
    this.api.closeSession().subscribe();
  }

  getIsNetworkView() {
    const viewPrefs = this.api.getViewPreferences();

    if (viewPrefs && viewPrefs.hasOwnProperty('isNetworkView')) {
      return viewPrefs.isNetworkView;
    } else {
      return this.setIsNetworkView();
    }
  }

  setIsNetworkView(network = true) {
    this.api.updateViewPreferences({ isNetworkView: network });
    return network;
  }

  viewMode(isNetworkView: boolean) {
    this.isNetworkView = this.setIsNetworkView(isNetworkView);

    if (this.categoryId) {
      if (this.isNetworkView) {
        // Go up the hierarchy to the Level 1 or 0 parent for this category
        this.api.getCategory(parseInt(this.categoryId, 10)).subscribe(c => {
          let catId: number;
          if (c.level === 2) {
            catId = c.parent.id;
          }
          if (c.level <= 1) {
            catId = c.id;
          }
          this.router.navigate(['category', catId.toString(), 'network']);
        });

      } else {
        // Go up the hierarchy to the Level 0 parent for this category
        this.api.getCategory(parseInt(this.categoryId, 10)).subscribe(c => {
          if (c.level === 2) {
            this.router.navigate(['category', c.id.toString()]);
          } else {
            let catId: number;

            if (c.level === 0) {
              catId = c.id;
            } else if (c.level === 1) {
              catId = c.parent.id;
            }
            this.router.navigate(['browse', catId.toString()]);
          }
        });
      }
    }
  }
}
