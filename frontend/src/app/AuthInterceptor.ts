/* Intercepts all calls to the backend and assigns an authorization code so we
*  know who this nice person is.  */

// import { AuthService } from '../auth.service';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  authToken: String;

  //  constructor(private auth: AuthService) {}
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    // const authToken = this.auth.getAuthorizationToken();
    this.authToken = 'InValidAuthToken';

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.authToken}`
      }
    });

    // send cloned request with header to the next handler.
    return next.handle(req);
  }
}
