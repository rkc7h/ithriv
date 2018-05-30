import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import {Observable, throwError} from 'rxjs/Observable';
import {environment} from '../environments/environment';
import {ResourceQuery} from './resource-query';
import {Category} from './category';
import {Resource} from './resource';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;
  resource_url = `${this.apiRoot}/api/resource`;
  category_url = `${this.apiRoot}/api/category`;
  search_resource_url = `${this.apiRoot}/api/search`;
  token: string;

  constructor(private httpClient: HttpClient) { }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


  searchResources(query: ResourceQuery): Observable<ResourceQuery> {
    const result = this.httpClient.post<ResourceQuery>(this.search_resource_url, query);
    console.log('The Result is: ' + result);
    return result;
  }

  getCategory(id: Number): Observable<Category> {
    const result = this.httpClient.get<Category>(this.category_url + "/" + id);
    return result;
  }

  getCategoryResources(category: Category): Observable<Resource[]> {
    const result = this.httpClient.get<Resource[]>(this.apiRoot + category._links.resources);
    return result;
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.put<Category>(this.apiRoot + category._links.self, category)
  }

  addCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(this.category_url, category)
  }

  deleteCategory(category: Category): Observable<any> {
    return this.httpClient.delete<Category>(this.apiRoot + category._links.self)
      .pipe(
        catchError(this.handleError)
      );
  }

}
