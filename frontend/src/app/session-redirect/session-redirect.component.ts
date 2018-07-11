import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceApiService} from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-session-redirect',
  template: ''
})
export class SessionRedirectComponent  {
  // Accepts a token from the server, then redirects the user
  // to the home page.  This allows single sign on through
  // Shibboleth.

  constructor(private api: ResourceApiService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.params.subscribe(params => {
      api.openSession(params['token']);
      this.router.navigate(['']);
    });
  }
}
