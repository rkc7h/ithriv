import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Category } from './category';
import { Resource } from './resource';
import { ResourceCategory } from './resource-category';
import { ResourceQuery } from './resource-query';
import { CategoryResource } from './category-resource';
import { Icon } from './icon';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;
  category_url = `${this.apiRoot}/api/category`;
  icon_url = `${this.apiRoot}/api/icon`;
  resource_category_url = `${this.apiRoot}/api/resource_category`;
  resource_url = `${this.apiRoot}/api/resource`;
  search_resource_url = `${this.apiRoot}/api/search`;
  token: string;

  constructor(private httpClient: HttpClient) { }


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


  searchResources(query: ResourceQuery): Observable<ResourceQuery> {
    return this.httpClient.post<ResourceQuery>(this.search_resource_url, query)
      .pipe(catchError(this.handleError));
  }

  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.category_url)
      .pipe(catchError(this.handleError));
  }

  getCategory(id: Number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.category_url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCategoryResources(category: Category): Observable<CategoryResource[]> {
    return this.httpClient.get<CategoryResource[]>(this.apiRoot + category._links.resources)
      .pipe(catchError(this.handleError));
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.put<Category>(this.apiRoot + category._links.self, category)
      .pipe(catchError(this.handleError));
  }

  addCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(this.category_url, category)
      .pipe(catchError(this.handleError));
  }

  deleteCategory(category: Category): Observable<any> {
    return this.httpClient.delete<Category>(this.apiRoot + category._links.self)
      .pipe(catchError(this.handleError));
  }

  getIcons(): Observable<Icon[]> {
    return this.httpClient.get<Icon[]>(this.icon_url)
      .pipe(catchError(this.handleError));
  }

  getResource(id: Number): Observable<Resource> {
    return this.httpClient.get<Resource>(`${this.resource_url}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateResource(resource: Resource): Observable<Resource> {
    return this.httpClient.put<Resource>(this.apiRoot + resource._links.self, resource)
      .pipe(catchError(this.handleError));
  }

  addResource(resource: Resource): Observable<Resource> {
    return this.httpClient.post<Resource>(this.resource_url, resource)
      .pipe(catchError(this.handleError));
  }

  linkResourceAndCategory(resource: Resource, category: Category): Observable<any> {
    const rc: ResourceCategory = { resource_id: resource.id, category_id: category.id };
    return this.httpClient.post<ResourceCategory>(this.resource_category_url, rc)
      .pipe(catchError(this.handleError));
  }

  deleteResource(resource: Resource): Observable<any> {
    return this.httpClient.delete<Resource>(this.apiRoot + resource._links.self)
      .pipe(catchError(this.handleError));
  }

}
