import { MediaMatcher } from '@angular/cdk/layout';
import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSidenav } from '@angular/material';
import {
  ActivatedRoute,
  ActivationEnd,
  ActivationStart,
  NavigationEnd,
  Router
} from '@angular/router';
import { environment } from '../../environments/environment';
import { Institution } from '../institution';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeTransition()]
})

export class HeaderComponent implements OnInit, OnDestroy {
  @HostBinding('@fadeTransition')
  title: string;
  isHome = false;
  login_url = environment.api + '/api/login';
  hideHeader = false;
  categoryId: string;
  isResourceView = false;
  isNetworkView: boolean;
  session: User;
  institution: Institution;

  @ViewChild('sidenav') sidenav: MatSidenav;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private api: ResourceApiService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.mobileQuery = media.matchMedia('(max-width: 959px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

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
    this.getInstitution();
    this.api.getSession().subscribe(user => {
      this.session = user;
    }, error1 => {
      this.session = null;
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  goLogin($event) {
    $event.preventDefault();
    this.router.navigate(['login']);
  }

  goConsult($event) {
    $event.preventDefault();
    this.router.navigate(['consult_request']);
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

  getInstitution() {
    if (sessionStorage.getItem('institution_id')) {
      this.api.getInstitution(parseInt(sessionStorage.getItem('institution_id'), 10)).subscribe(
        (inst) => {
          this.institution = inst;
        }
      );
    }
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

    // URL may have been modified via location.replaceState. Retrieve
    // categoryId from raw URL path string.
    const pathArray = this.location.path().split('/');

    if (
      pathArray &&
      (pathArray.length === 3) &&
      (pathArray[1] === 'network' || pathArray[1] === 'browse') &&
      /^[0-9]+$/.test(pathArray[2])
    ) {
      this.categoryId = pathArray[2];
    }

    this.isNetworkView = this.setIsNetworkView(isNetworkView);

    if (this.categoryId) {
      if (this.isNetworkView) {
        this.router.navigate(['network', this.categoryId]);

        // Go up the hierarchy to the Level 1 or 0 parent for this category
        this.api.getCategory(parseInt(this.categoryId, 10)).subscribe(c => {
          let catId: number;
          if (c.level === 2) {
            catId = c.parent.id;
          }
          if (c.level <= 1) {
            catId = c.id;
          }
          this.router.navigate(['network', catId.toString()]);
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
    } else {
      if (this.isNetworkView) {
        this.router.navigate(['network']);
      } else {
        this.router.navigate(['browse']);
      }
    }
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  closeSidenav() {
    this.sidenav.close();
  }

}
