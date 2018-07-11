import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../../category';
import { Resource } from '../../resource';
import { ResourceCategory } from '../../resource-category';
import { ResourceQuery } from '../../resource-query';
import { CategoryResource } from '../../category-resource';
import { Icon } from '../../icon';
import {User} from '../../user';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;
  category_url = `${this.apiRoot}/api/category`;
  icon_url = `${this.apiRoot}/api/icon`;
  resource_category_url = `${this.apiRoot}/api/resource_category`;
  resource_url = `${this.apiRoot}/api/resource`;
  search_resource_url = `${this.apiRoot}/api/search`;
  session_url = `${this.apiRoot}/api/session`;

  session: User;  // The current user is always directly accessible via this variable.

  constructor(private httpClient: HttpClient) {
    if (localStorage.getItem('token')) {
      // todo:  Notify user if their token expired.
      this._getSession().subscribe(s => {
        this.session = s;
      });
    }
  }

  openSession(token) {
    localStorage.setItem('token', token);
    this._getSession().subscribe(s => {
      this.session = s;
    });
  }

  closeSession() {
    localStorage.removeItem('token');
    this._deleteSession().subscribe(s => {
      this.session = null;
    });

  }

  /** Get current users information, if logged in */
  _getSession(): Observable<User> {
    return this.httpClient.get<User>(this.session_url)
      .pipe(catchError(this.handleError));
  }

  /** Logging out */
  _deleteSession(): Observable<any> {
    return this.httpClient.delete<User>(this.session_url)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Something bad happened; please try again later.';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned a status code ${error.status}, ` +
        `Code was: ${JSON.stringify(error.error.code)}, ` +
        `Message was: ${JSON.stringify(error.error.message)}`);
      message = error.error.message;
    }
    // return an observable with a user-facing error message
    // FIXME: Log all error messages to Google Analytics
    return throwError(message);
  }

  /** searchResources */
  searchResources(query: ResourceQuery): Observable<ResourceQuery> {
    return this.httpClient.post<ResourceQuery>(this.search_resource_url, query)
      .pipe(catchError(this.handleError));
  }

  /** getCategories */
  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.category_url)
      .pipe(catchError(this.handleError));
  }

  /** getCategory */
  getCategory(id: Number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.category_url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** getCategoryResources */
  getCategoryResources(category: Category): Observable<CategoryResource[]> {
    return this.httpClient.get<CategoryResource[]>(this.apiRoot + category._links.resources)
      .pipe(catchError(this.handleError));
  }

  /** updateCategory */
  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.put<Category>(this.apiRoot + category._links.self, category)
      .pipe(catchError(this.handleError));
  }

  /** addCategory */
  addCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(this.category_url, category)
      .pipe(catchError(this.handleError));
  }

  /** deleteCategory */
  deleteCategory(category: Category): Observable<any> {
    return this.httpClient.delete<Category>(this.apiRoot + category._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getIcons */
  getIcons(): Observable<Icon[]> {
    return this.httpClient.get<Icon[]>(this.icon_url)
      .pipe(catchError(this.handleError));
  }

  /** getResource */
  getResource(id: Number): Observable<Resource> {
    return this.httpClient.get<Resource>(`${this.resource_url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** updateResource */
  updateResource(resource: Resource): Observable<Resource> {
    return this.httpClient.put<Resource>(this.apiRoot + resource._links.self, resource)
      .pipe(catchError(this.handleError));
  }

  /** addResource */
  addResource(resource: Resource): Observable<Resource> {
    return this.httpClient.post<Resource>(this.resource_url, resource)
      .pipe(catchError(this.handleError));
  }

  /** linkResourceAndCategory */
  linkResourceAndCategory(resource: Resource, category: Category): Observable<any> {
    const rc: ResourceCategory = { resource_id: resource.id, category_id: category.id };
    return this.httpClient.post<ResourceCategory>(this.resource_category_url, rc)
      .pipe(catchError(this.handleError));
  }

  /** deleteResource */
  deleteResource(resource: Resource): Observable<any> {
    return this.httpClient.delete<Resource>(this.apiRoot + resource._links.self)
      .pipe(catchError(this.handleError));
  }
}
