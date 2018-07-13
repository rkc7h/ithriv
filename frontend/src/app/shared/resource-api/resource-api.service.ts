import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { Institution } from '../../institution';
import { ResourceType } from '../../resourceType';

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
    resourceCategoryList: '/api/resource_category',
    resourceCategory: '/api/resource_category/<id>',
    iconList: '/api/icon',
    icon: '/api/icon/<id>',
  };

  constructor(private httpClient: HttpClient) {
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

  /** updateResource */
  updateResource(resource: Resource): Observable<Resource> {
    return this.httpClient.put<Resource>(this.apiRoot + resource._links.self, resource)
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

}
