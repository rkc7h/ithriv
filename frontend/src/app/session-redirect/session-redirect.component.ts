import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-session-redirect',
  templateUrl: 'session-redirect.component.html',
  styleUrls: ['./session-redirect.component.scss']
})
export class SessionRedirectComponent {
  // Accepts a token from the server, then redirects the user
  // to the home page.  This allows single sign on through
  // Shibboleth.

  constructor(
    private api: ResourceApiService,
    private route: ActivatedRoute,
    private router: Router) {

    this.route.params.subscribe(params => {
      if (params.hasOwnProperty('token')) {
        const token = params['token'];

        if (token) {
          localStorage.setItem('token', token);
          this.api.getSession().subscribe(_ => this.goPrevUrl(token));
        }
      }

      // this.goPrevUrl();
    });
  }

  goPrevUrl(token?: string) {
    const prevUrl = localStorage.getItem('prev_url') || '/';
    this.router.navigateByUrl(prevUrl).then(() => {
      localStorage.removeItem('prev_url');
    });
  }
}
