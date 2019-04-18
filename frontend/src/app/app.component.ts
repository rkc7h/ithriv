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
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivationEnd,
  ActivationStart,
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';
import { Icon } from './icon';
import { Institution } from './institution';
import { fadeTransition } from './shared/animations';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { User } from './user';
import { IntervalService } from './shared/interval/interval.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeTransition()],
})
export class AppComponent implements OnInit, OnDestroy {
  session: User = null;
  timeLeftInSession: number;

  @ViewChild('sidenav') sidenav: MatSidenav;
  categoryId: string;

  @HostBinding('@fadeTransition')
  hideHeader = false;
  icons: Icon[];
  institution: Institution;
  isHome = false;
  isNetworkView: boolean;
  isResourceView = false;
  mobileQuery: MediaQueryList;
  title = 'iTHRIV';
  pageTitle = 'Find Resources';
  trustUrl;

  private _mobileQueryListener: () => void;
  public ga_tracking_code: string;

  public constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private api: ResourceApiService,
    private location: Location,
    private router: Router,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    public iconRegistry: MatIconRegistry,
    private route: ActivatedRoute,
    private intervalService: IntervalService,
    private deviceDetector: DeviceDetectorService
  ) {
    this.ga_tracking_code = environment.ga_tracking_id;
    (<any>window).ga('create', this.ga_tracking_code, 'auto');
    if (
      this.deviceDetector &&
      this.deviceDetector.browser &&
      (this.deviceDetector.browser.toLowerCase() === 'ie')
    ) {
      this.router.navigate(['upgrade_browser']);
    }

    this.trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl;
    this.loadIcons();
    this.mobileQuery = media.matchMedia('(max-width: 959px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        (<any>window).ga('set', 'page', e.urlAfterRedirects);
        (<any>window).ga('send', 'pageview');
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams && queryParams.hasOwnProperty('auth_token')) {
            const token = queryParams.auth_token;

            if (token) {
              localStorage.setItem('token', token);
            }
          }

          this.checkStatus();
        });

      }

      if (e instanceof ActivationStart || e instanceof ActivationEnd) {
        if (e.snapshot && e.snapshot.data) {
          const data = e.snapshot.data;
          this.title = data.title ? `iTHRIV - ${data.title}` : 'iTHRIV';
          this.titleService.setTitle(this.title);
          this.categoryId = e.snapshot && e.snapshot.params && e.snapshot.params.category;
          this.hideHeader = !!data.hideHeader;
          this.pageTitle = data.title || 'Find Resources';
        }
      }

      if (e instanceof NavigationEnd) {
        this.isHome = ['/', '/search'].indexOf(e.url) > -1;
        this.isResourceView = /^\/resource\//.test(e.url);
      }
    });

    this.isNetworkView = this.getIsNetworkView();
    const numMinutes = 1;

    this.intervalService.setInterval(() => {
      // Update seconds
      this.timeLeftInSession -= 1000;

      // Check status every numMinutes
      if ((this.timeLeftInSession % (numMinutes * 60 * 1000)) < 1000) {
        this.checkStatus();
      }
    }, 1000);

  }

  // Warn the user if there session has less than 5 minutes remaining.
  toolBarWarningClass() {
    if (this.session && this.timeLeftInSession < 300000) {
      return 'warning';
    } else {
      return '';
    }
  }

  checkStatus() {
    const token = localStorage.getItem('token');

    if (token) {
      this.api.getSessionStatus().subscribe((timestamp: number) => {
        const now = new Date();
        const exp = new Date(timestamp * 1000);
        const msLeft: number = exp.getTime() - now.getTime();
        const loggedOut = (timestamp <= 0) || (msLeft <= 0);
        this.timeLeftInSession = msLeft;

        if (loggedOut) {
          this.api.closeSession().subscribe((_: any) => {
            this.intervalService.clearInterval();
            this.session = null;
            this.router.navigate(['timedout']);
          });
        } else {
          this.api.getSession().subscribe(user => {
            this.session = user;
            this.getInstitution();
          });
        }
      });
    }
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  loadIcons() {
    this.api.getIcons().subscribe(icons => {
      this.icons = icons;
      this.loadIconRegistry();
    });
  }

  loadIconRegistry() {
    for (const key in this.icons) {
      if (this.icons.hasOwnProperty(key)) {
        this.registerIcon(this.icons[key]);
      }
    }
  }

  registerIcon(icon: Icon) {
    this.iconRegistry.addSvgIcon(
      `ithriv_${icon.id}`,
      this.trustUrl(icon.url)
    );
  }

  getState(outlet: RouterOutlet) {
    return outlet.activatedRouteData.state;
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  goLogin($event) {
    $event.preventDefault();
    const prevUrl = this.router.url;
    localStorage.setItem('prev_url', prevUrl);
    this.router.navigate(['login']);
  }

  goHelp($event) {
    $event.preventDefault();
    this.router.navigate(['help']);
  }

  goUserAdmin($event) {
    $event.preventDefault();
    this.router.navigate(['admin/users']);
  }

  goLogout($event) {
    $event.preventDefault();
    localStorage.setItem('prev_url', this.router.url);
    this.api.closeSession().subscribe();
    this.session = null;
    this.router.navigate(['logout']);
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

  isGraphViewSupported() {
    const ieVersion = this.getInternetExplorerVersion();
    if ((ieVersion === -1) || (ieVersion > 11)) {
      return true;
    } else {
      this.setIsNetworkView(false);
      return false;
    }
  }

  getInternetExplorerVersion() {
    let rv = -1;
    if (navigator.appName === 'Microsoft Internet Explorer') {
      const ua = navigator.userAgent;
      const re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
      if (re.exec(ua) != null) { rv = parseFloat(RegExp.$1); }
    } else if (navigator.appName === 'Netscape') {
      const ua = navigator.userAgent;
      const re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');
      if (re.exec(ua) != null) { rv = parseFloat(RegExp.$1); }
    }
    return rv;
  }
}
