import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Availability } from '../../availability';
import { Category } from '../../category';
import { CategoryResource } from '../../category-resource';
import { Icon } from '../../icon';
import { Institution } from '../../institution';
import { Resource } from '../../resource';
import { ResourceCategory } from '../../resource-category';
import { ResourceQuery } from '../../resource-query';
import { ResourceType } from '../../resourceType';
import { User } from '../../user';
import { Favorite } from '../../favorite';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;
  token: string;

  // REST endpoints
  endpoints = {
    resourceList: '/api/resource',
    resource: '/api/resource/<id>',
    categoryByResource: '/api/resource/<resource_id>/category',
    categoryList: '/api/category',
    category: '/api/category/<id>',
    resourceByCategory: '/api/category/<category_id>/resource',
    institution: '/api/institution/<id>',
    institutionList: '/api/institution',
    type: '/api/type/<id>',
    typeList: '/api/type',
    search: '/api/search',
    resourceAvailabilityList: '/api/resource_institution',
    resourceAvailability: '/api/resource_institution/<id>',
    availabilityList: '/api/availability',
    availability: '/api/availability/<id>',
    resourceCategoryList: '/api/resource_category',
    resourceCategory: '/api/resource_category/<id>',
    iconList: '/api/icon',
    icon: '/api/icon/<id>',
    favoriteList: '/api/favorite',
    favorite: '/api/favorite/<id>',
    userFavorites: '/api/session/favorite',
    userList: '/api/user',
    login_password: '/api/login_password',
    forgot_password: '/api/forgot_password',
    reset_password: '/api/reset_password',
    session: '/api/session'
  };

  session: User;  // The current user is always directly accessible via this variable.

  constructor(private httpClient: HttpClient) {
    if (localStorage.getItem('token')) {
      // todo:  Notify user if their token expired.
      this._getSession().subscribe(s => {
        this.session = s;
      });
    }
  }

  openSession(token: string, callback?: Function) {
    localStorage.setItem('token', token);
    this._getSession().subscribe(s => {
      this.session = s;
      if (callback) {
        callback(this.session);
      }
    });
  }

  /** loginUser - An alternative to single sign on, allow users to log into the system with a user name and password.
   * email_token is not required, only send this if user is logging in for the first time
   * after an email verification link. */
  login(email: string, password: string, email_token = ''): Observable<any> {
    const options = { email: email, password: password, email_token: email_token };
    return this.httpClient.post(this.apiRoot + this.endpoints.login_password, options)
      .pipe(catchError(this.handleError));
  }

  closeSession(callback: Function) {
    this._deleteSession().subscribe(s => {
      this.session = null;
      callback(this.session);
    });
    localStorage.removeItem('token');
  }

  /** Get current users information, if logged in */
  _getSession(): Observable<User> {
    return this.httpClient.get<User>(this.apiRoot + this.endpoints.session)
      .pipe(catchError(this.handleError));
  }

  /** Logging out */
  _deleteSession(): Observable<any> {
    return this.httpClient.delete<User>(this.apiRoot + this.endpoints.session)
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
    return this.httpClient.post<ResourceQuery>(this.apiRoot + this.endpoints.search, query)
      .pipe(catchError(this.handleError));
  }

  /** getCategories */
  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.apiRoot + this.endpoints.categoryList)
      .pipe(catchError(this.handleError));
  }

  /** getCategory */
  getCategory(id: Number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.apiRoot + this.endpoints.categoryList}/${id}`)
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
    return this.httpClient.post<Category>(this.apiRoot + this.endpoints.categoryList, category)
      .pipe(catchError(this.handleError));
  }

  /** deleteCategory */
  deleteCategory(category: Category): Observable<any> {
    return this.httpClient.delete<Category>(this.apiRoot + category._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getIcons */
  getIcons(): Observable<Icon[]> {
    return this.httpClient.get<Icon[]>(this.apiRoot + this.endpoints.iconList)
      .pipe(catchError(this.handleError));
  }

  /** getInstitutions */
  getInstitutions(): Observable<Institution[]> {
    return this.httpClient.get<Institution[]>(this.apiRoot + this.endpoints.institutionList)
      .pipe(catchError(this.handleError));
  }

  /** getTypes */
  getTypes(): Observable<ResourceType[]> {
    return this.httpClient.get<ResourceType[]>(this.apiRoot + this.endpoints.typeList)
      .pipe(catchError(this.handleError));
  }

  /** getResource */
  getResource(id: Number): Observable<Resource> {
    return this.httpClient.get<Resource>(`${this.apiRoot + this.endpoints.resourceList}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** getResourceCategories */
  getResourceCategories(resource: Resource): Observable<ResourceCategory[]> {
    const url = this.endpoints.categoryByResource.replace('<resource_id>', resource.id.toString());
    return this.httpClient.get<ResourceCategory[]>(this.apiRoot + url)
      .pipe(catchError(this.handleError));
  }

  /** updateResourceCategories */
  updateResourceCategories(resource: Resource, categories: CategoryResource[]): Observable<CategoryResource[]> {
    return this.httpClient.post<CategoryResource[]>(this.apiRoot + resource._links.categories, categories)
      .pipe(catchError(this.handleError));
  }

  /** updateResource */
  updateResource(resource: Resource): Observable<Resource> {
    return this.httpClient.put<Resource>(this.apiRoot + resource._links.self, resource)
      .pipe(catchError(this.handleError));
  }

  updateResourceAvailability(resource: Resource, avails: Availability[]) {
    return this.httpClient.post<Availability>(this.apiRoot + resource._links.availability, avails)
      .pipe(catchError(this.handleError));
  }

  /** addResource */
  addResource(resource: Resource): Observable<Resource> {
    return this.httpClient.post<Resource>(this.apiRoot + this.endpoints.resourceList, resource)
      .pipe(catchError(this.handleError));
  }

  /** linkResourceAndCategory */
  linkResourceAndCategory(resource: Resource, category: Category): Observable<any> {
    const options = { resource_id: resource.id, category_id: category.id };
    return this.httpClient.post<ResourceCategory>(this.apiRoot + this.endpoints.resourceCategoryList, options)
      .pipe(catchError(this.handleError));
  }

  /** unlinkResourceAndCategory */
  unlinkResourceAndCategory(rc: ResourceCategory): Observable<any> {
    return this.httpClient.delete<ResourceCategory>(this.apiRoot + rc._links.self)
      .pipe(catchError(this.handleError));
  }

  /** deleteResource */
  deleteResource(resource: Resource): Observable<any> {
    return this.httpClient.delete<Resource>(this.apiRoot + resource._links.self)
      .pipe(catchError(this.handleError));
  }

  /** addFavorite */
  addFavorite(user: User, resource: Resource): Observable<any> {
    const options = { resource_id: resource.id, user_id: user.id };
    return this.httpClient.post<Favorite>(this.apiRoot + this.endpoints.favoriteList, options)
      .pipe(catchError(this.handleError));
  }

  /** deleteFavorite */
  deleteFavorite(favorite: Favorite): Observable<any> {
    return this.httpClient.delete<Favorite>(this.apiRoot + favorite._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getUserFavorites */
  getUserFavorites(): Observable<Favorite[]> {
    return this.httpClient.get<Favorite[]>(this.apiRoot + this.endpoints.userFavorites)
      .pipe(catchError(this.handleError));
  }

  /** updateUser */
  updateUser(user: User): Observable<User> {
    return this.httpClient.put<User>(this.apiRoot + user._links.self, user)
      .pipe(catchError(this.handleError));
  }

  /** addUser */
  addUser(user: User): Observable<User> {
    return this.httpClient.post<User>(this.apiRoot + this.endpoints.userList, user)
      .pipe(catchError(this.handleError));
  }

  /** deleteUser */
  deleteUser(user: User): Observable<any> {
    return this.httpClient.delete<User>(this.apiRoot + user._links.self)
      .pipe(catchError(this.handleError));
  }

  /** Reset password */
  sendResetPasswordEmail(email: String): Observable<any> {
    const email_data = {email: email};
    return this.httpClient.post<any>(this.apiRoot + this.endpoints.forgot_password, email_data)
      .pipe(catchError(this.handleError));
  }

  /** Reset password */
  resetPassword(newPassword: string, email_token: string): Observable<string> {
    const reset = {password: newPassword, email_token: email_token};
    return this.httpClient.post<string>(this.apiRoot + this.endpoints.reset_password, reset)
      .pipe(catchError(this.handleError));
  }

}


