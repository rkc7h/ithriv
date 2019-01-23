import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { Observable, throwError, of as observableOf } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { catchError, last, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Availability } from '../../availability';
import { Category } from '../../category';
import { CategoryResource } from '../../category-resource';
import { Favorite } from '../../favorite';
import { FileAttachment } from '../../file-attachment';
import { Icon } from '../../icon';
import { Institution } from '../../institution';
import { Resource } from '../../resource';
import { ResourceAttachment } from '../../resource-attachment';
import { ResourceCategory } from '../../resource-category';
import { ResourceQuery } from '../../resource-query';
import { ResourceType } from '../../resourceType';
import { User } from '../../user';
import { UserSearchResults } from '../../user-search-results';
import { ViewPreferences } from '../../view-preferences';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;

  // REST endpoints
  endpoints = {
    availability: '/api/availability/<id>',
    availabilitylist: '/api/availability',
    categorybyresource: '/api/resource/<resource_id>/category',
    category: '/api/category/<id>',
    categorylist: '/api/category',
    favorite: '/api/favorite/<id>',
    favoritelist: '/api/favorite',
    file: '/api/file/<id>',
    filelist: '/api/file',
    icon: '/api/icon/<id>',
    iconlist: '/api/icon',
    institutionavailabilitylist: '/api/institution/availability',
    institution: '/api/institution/<id>',
    institutionlist: '/api/institution',
    resourceavailability: '/api/resource/<resource_id>/availability',
    resourcebycategory: '/api/category/<category_id>/resource',
    resourcecategory: '/api/resource_category/<id>',
    resourcecategorylist: '/api/resource_category',
    resource: '/api/resource/<id>',
    resourcelist: '/api/resource',
    rootcategorylist: '/api/category/root',
    search: '/api/search',
    session: '/api/session',
    sessionstatus: '/api/session_status',
    type: '/api/type/<id>',
    typelist: '/api/type',
    user: '/api/user/<id>',
    userfavorite: '/api/session/favorite',
    userlist: '/api/user',
    userresource: '/api/session/resource',
    approval_request: '/api/approval_request',
    forgot_password: '/api/forgot_password',
    login_password: '/api/login_password',
    reset_password: '/api/reset_password',
    consult_request: '/api/consult_request',
    root: '/',
    sso_login: '/api/login',
    static: '/static/<filename>',
    logo: '/api/track/<user_id>/<code>/logo.png',
  };

  private sessionSubject = new BehaviorSubject<User>(null);

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {
  }

  /** getSession */
  public getSession(): Observable<User> {
    if (localStorage.getItem('token')) {
      return this.httpClient.get<User>(this._apiUrl('session'))
        .pipe(catchError(this.handleError));
    } else {
      return observableOf(null);
    }
  }

  /** openSession */
  openSession(token: string): Observable<User> {
    if (token) {
      localStorage.setItem('token', token);
    }
    return this.getSession();
  }

  /** closeSession */
  closeSession(): Observable<User> {
    localStorage.removeItem('token');
    return this.httpClient.delete<User>(this._apiUrl('session'));
  }

  /** getSessionStatus */
  getSessionStatus(): Observable<number> {
    const token: string = localStorage.getItem('token');
    if (token) {
      return this.httpClient.get<number>(this._apiUrl('sessionstatus'))
        .pipe(catchError(this.sessionStatusError));
    } else {
      return observableOf(0);
    }
  }

  // Special error handler for get Session Status clears out the users local session if we get
  // an unauthorized message.
  private sessionStatusError(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.removeItem('token');
    }
    return this.handleError(error);
  }


    /** login - An alternative to single sign on, allow users to log into the system with a user name and password.
   * email_token is not required, only send this if user is logging in for the first time
   * after an email verification link. */
  login(email: string, password: string, email_token = ''): Observable<any> {
    const options = { email, password, email_token };
    return this.httpClient.post(this._apiUrl('login_password'), options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Something bad happened; please try again lather.';

    console.error(error);

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
      // If this was a 401 error, re-verify they have a valid session.
      if (error.error.code === 401) {
        this.getSession();
      }
    }
    // return an observable with a user-facing error message
    // FIXME: Log all error messages to Google Analytics
    return throwError(message);
  }

  /** updateViewPreferences */
  updateViewPreferences(preferences: ViewPreferences) {
    localStorage.setItem('viewPreferences', JSON.stringify(preferences));
  }

  /** getViewPreferences */
  getViewPreferences(): ViewPreferences {
    const viewPrefs = JSON.parse(localStorage.getItem('viewPreferences'));
    if (viewPrefs) {
      return viewPrefs;
    } else {
      // Initialize view preferences
      this.updateViewPreferences({ isNetworkView: true });
      return this.getViewPreferences();
    }
  }

  /** searchResources */
  searchResources(query: ResourceQuery): Observable<ResourceQuery> {
    return this.httpClient.post<ResourceQuery>(this._apiUrl('search'), query)
      .pipe(catchError(this.handleError));
  }

  /** getCategories */
  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this._apiUrl('categorylist'))
      .pipe(catchError(this.handleError));
  }

  /** getRootCategories */
  getRootCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this._apiUrl('rootcategorylist'))
      .pipe(catchError(this.handleError));
  }

  /** getCategory */
  getCategory(id: Number): Observable<Category> {
    return this.httpClient.get<Category>(`${this._apiUrl('categorylist')}/${id}`)
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
    return this.httpClient.post<Category>(this._apiUrl('categorylist'), category)
      .pipe(catchError(this.handleError));
  }

  /** deleteCategory */
  deleteCategory(category: Category): Observable<Category> {
    return this.httpClient.delete<Category>(this.apiRoot + category._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getIcons */
  getIcons(): Observable<Icon[]> {
    return this.httpClient.get<Icon[]>(this._apiUrl('iconlist'))
      .pipe(catchError(this.handleError));
  }

  /** getInstitutions */
  getInstitutions(): Observable<Institution[]> {
    return this.httpClient.get<Institution[]>(this._apiUrl('institutionlist'))
      .pipe(catchError(this.handleError));
  }

  /** getAvailabilityInstitutions */
  getAvailabilityInstitutions(): Observable<Institution[]> {
    return this.httpClient.get<Institution[]>(this._apiUrl('institutionavailabilitylist'))
      .pipe(catchError(this.handleError));
  }

  /** getInstitution */
  getInstitution(id: Number): Observable<Institution> {
    return this.httpClient.get<Institution>(`${this._apiUrl('institutionlist')}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** getTypes */
  getTypes(): Observable<ResourceType[]> {
    return this.httpClient.get<ResourceType[]>(this._apiUrl('typelist'))
      .pipe(catchError(this.handleError));
  }

  /** getResource */
  getResource(id: Number): Observable<Resource> {
    return this.httpClient.get<Resource>(`${this._apiUrl('resourcelist')}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** getResources */
  getResources(): Observable<Resource[]> {
    return this.httpClient.get<Resource[]>(this._apiUrl('resourcelist'))
      .pipe(catchError(this.handleError));
  }

  /** getResourceCategories */
  getResourceCategories(resource: Resource): Observable<ResourceCategory[]> {
    const url = this._apiUrl('categorybyresource').replace('<resource_id>', resource.id.toString());
    return this.httpClient.get<ResourceCategory[]>(url)
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

  /** updateResourceAvailability */
  updateResourceAvailability(resource: Resource, avails: Availability[]): Observable<Availability> {
    return this.httpClient.post<Availability>(this.apiRoot + resource._links.availability, avails)
      .pipe(catchError(this.handleError));
  }

  /** addResource */
  addResource(resource: Resource): Observable<Resource> {
    return this.httpClient.post<Resource>(this._apiUrl('resourcelist'), resource)
      .pipe(catchError(this.handleError));
  }

  /** linkResourceAndCategory */
  linkResourceAndCategory(resource: Resource, category: Category): Observable<ResourceCategory> {
    const options = { resource_id: resource.id, category_id: category.id };
    return this.httpClient.post<ResourceCategory>(this._apiUrl('resourcecategorylist'), options)
      .pipe(catchError(this.handleError));
  }

  /** unlinkResourceAndCategory */
  unlinkResourceAndCategory(rc: ResourceCategory): Observable<ResourceCategory> {
    return this.httpClient.delete<ResourceCategory>(this.apiRoot + rc._links.self)
      .pipe(catchError(this.handleError));
  }

  /** deleteResource */
  deleteResource(resource: Resource): Observable<Resource> {
    return this.httpClient.delete<Resource>(this.apiRoot + resource._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getAttachmentsByResources */
  getAttachmentsByResources(resource: Resource): Observable<ResourceAttachment[]> {
    return this.httpClient.get<ResourceAttachment[]>(this.apiRoot + resource._links.attachments)
      .pipe(catchError(this.handleError));
  }

  /** getFileAttachment */
  getFileAttachment(id?: number, md5?: string): Observable<FileAttachment> {
    const params = { id: String(id), md5: md5 };
    const url = this._apiUrl('filelist');

    return this.httpClient.get<FileAttachment>(url, { params: params })
      .pipe(catchError(this.handleError));
  }

  /** addFileAttachment */
  addFileAttachment(attachment: FileAttachment): Observable<FileAttachment> {
    const url = this._apiUrl('filelist');
    const attachmentMetadata = {
      file_name: attachment.name,
      display_name: attachment.name,
      date_modified: new Date(attachment.lastModified),
      md5: attachment.md5,
      mime_type: attachment.type,
      size: attachment.size
    };

    return this.httpClient.post<FileAttachment>(url, attachmentMetadata)
      .pipe(catchError(this.handleError));
  }

  /** addFileAttachmentBlob */
  addFileAttachmentBlob(attachmentId: number, attachment: FileAttachment, progress: NgProgressComponent): Observable<FileAttachment> {
    const url = this._apiUrl('file').replace('<id>', attachmentId.toString());
    const options: {
      headers?: HttpHeaders,
      observe: 'events',
      params?: HttpParams,
      reportProgress?: boolean,
      responseType: 'json',
      withCredentials?: boolean
    } = {
      observe: 'events',
      reportProgress: true,
      responseType: 'blob' as 'json'
    };

    return this.httpClient.put<File>(url, attachment, options)
      .pipe(
        map(event => this.showProgress(event, attachment, progress)),
        last(), // return last (completed) message to caller
        catchError(this.handleError)
      );
  }

  /** updateFileAttachment */
  updateFileAttachment(attachment: FileAttachment): Observable<FileAttachment> {
    const url = this._apiUrl('file').replace('<id>', attachment.id.toString());
    const attachmentMetadata = {
      display_name: attachment.display_name,
      date_modified: new Date(attachment.lastModified || attachment.date_modified),
      md5: attachment.md5,
      mime_type: attachment.type || attachment.mime_type,
      size: attachment.size,
      resource_id: attachment.resource_id
    };

    return this.httpClient.put<FileAttachment>(url, attachmentMetadata)
      .pipe(catchError(this.handleError));
  }

  /** getFileAttachmentBlob*/
  getFileAttachmentBlob(attachment: FileAttachment): Observable<Blob> {
    const options: {
      headers?: HttpHeaders,
      observe?: 'body',
      params?: HttpParams,
      reportProgress?: boolean,
      responseType: 'json',
      withCredentials?: boolean,
    } = {
      responseType: 'blob' as 'json'
    };

    return this.httpClient.get<Blob>(attachment.url, options)
      .pipe(catchError(this.handleError));
  }

  /** deleteFileAttachment */
  deleteFileAttachment(attachment: FileAttachment): Observable<FileAttachment> {
    const url = this._apiUrl('file').replace('<id>', attachment.id.toString());
    return this.httpClient.delete<FileAttachment>(url)
      .pipe(catchError(this.handleError));
  }

  /** getUserResources
   * get resources that the user owns */
  getUserResources(): Observable<Resource[]> {
    return this.httpClient.get<Resource[]>(this._apiUrl('userresource'))
      .pipe(catchError(this.handleError));
  }

  /** addFavorite */
  addFavorite(user: User, resource: Resource): Observable<Favorite> {
    const options = { resource_id: resource.id, user_id: user.id };
    return this.httpClient.post<Favorite>(this._apiUrl('favoritelist'), options)
      .pipe(catchError(this.handleError));
  }

  /** deleteFavorite */
  deleteFavorite(favorite: Favorite): Observable<Favorite> {
    return this.httpClient.delete<Favorite>(this.apiRoot + favorite._links.self)
      .pipe(catchError(this.handleError));
  }

  /** getUserFavorites */
  getUserFavorites(): Observable<Favorite[]> {
    return this.httpClient.get<Favorite[]>(this._apiUrl('userfavorite'))
      .pipe(catchError(this.handleError));
  }

  /** getUser
   * retrieve a user */
  getUser(id: number): Observable<User> {
    return this.httpClient.get<User>(this._apiUrl('userlist') + '/' + id)
      .pipe(catchError(this.handleError));
  }

  /** updateUser */
  updateUser(user: User): Observable<User> {
    return this.httpClient.put<User>(this.apiRoot + user._links.self, user)
      .pipe(catchError(this.handleError));
  }

  /** addUser */
  addUser(user: User): Observable<User> {
    return this.httpClient.post<User>(this._apiUrl('userlist'), user)
      .pipe(catchError(this.handleError));
  }

  /** deleteUser */
  deleteUser(user: User): Observable<User> {
    return this.httpClient.delete<User>(this.apiRoot + user._links.self)
      .pipe(catchError(this.handleError));
  }

  /** findUsers */
  findUsers(filter = '', sort = 'display_name', sortOrder = 'asc', pageNumber = 0, pageSize = 3): Observable<UserSearchResults> {
    const search_data = { filter: filter, sort: sort, sortOrder: sortOrder, pageNumber: String(pageNumber), pageSize: String(pageSize) };
    return this.httpClient.get<UserSearchResults>(this._apiUrl('userlist'), { params: search_data })
      .pipe(catchError(this.handleError));
  }

  /** sendResetPasswordEmail
   * Reset password */
  sendResetPasswordEmail(email: String): Observable<any> {
    const email_data = { email: email };
    return this.httpClient.post<any>(this._apiUrl('forgot_password'), email_data)
      .pipe(catchError(this.handleError));
  }

  /** resetPassword
   * Reset password */
  resetPassword(newPassword: string, email_token: string): Observable<string> {
    const reset = { password: newPassword, email_token: email_token };
    return this.httpClient.post<string>(this._apiUrl('reset_password'), reset)
      .pipe(catchError(this.handleError));
  }

  /** sendConsultRequestEmail
   * Request a Consult */
  sendConsultRequestEmail(user: User, request_category: string, request_text: string): Observable<any> {
    const request_data = { user_id: user.id, request_category: request_category, request_text: request_text };
    return this.httpClient.post<any>(this._apiUrl('consult'), request_data)
      .pipe(catchError(this.handleError));
  }

  /** sendApprovalRequestEmail
   * Request Resource Approval */
  sendApprovalRequestEmail(user: User, resource: Resource): Observable<any> {
    const request_data = { user_id: user.id, resource_id: resource.id };
    return this.httpClient.post<any>(this._apiUrl('approval_request'), request_data)
      .pipe(catchError(this.handleError));
  }

  /** showProgress
   * Return distinct message for sent, upload progress, & response events */
  private showProgress(event: HttpEvent<any>, attachment: FileAttachment, progress: NgProgressComponent): FileAttachment {
    switch (event.type) {
      case HttpEventType.Sent:
        progress.start();
        break;
      case HttpEventType.UploadProgress:
        progress.set(Math.round(100 * event.loaded / event.total));
        break;
      case HttpEventType.DownloadProgress:
        progress.set(Math.round(100 * event.loaded / event.total));
        break;
      case HttpEventType.Response:
        progress.complete();
        return attachment;
      default:
        break;
    }
  }

  private _apiUrl(key: string) {
    if (this.endpoints.hasOwnProperty(key)) {
      return this.apiRoot + this.endpoints[key];
    } else {
    }
  }
}


