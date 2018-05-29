import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
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


}
