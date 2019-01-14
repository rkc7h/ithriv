import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-session-redirect',
  template: ''
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

          console.log(`params['token']: ${params['token']}`);
        }
      }

      const storedToken = localStorage.getItem('token');
      console.log('storedToken:', storedToken);

      this.api.getSessionStatus().subscribe(timestamp => {
        if (timestamp > 0) {
          this.api.getUserSession().subscribe(session => {
            const prevUrl = localStorage.getItem('prev_url');
            if (prevUrl) {
              this.router.navigateByUrl(prevUrl).then(() => {
                localStorage.removeItem('prev_url');
              });
            } else {
              // this.router.navigate(['']);
            }
          });
        }
      });
    });
  }
}
