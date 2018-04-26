import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../environments/environment';
import {ResourceQuery} from './resource-query';

@Injectable()
export class ResourceApiService {

  apiRoot = environment.api;
  resource_url = `${this.apiRoot}/api/resource`;
  search_resource_url = `${this.resource_url}/search`;
  token: string;

  constructor(private httpClient: HttpClient) { }

  searchResources(query: ResourceQuery): Observable<ResourceQuery> {
    const result = this.httpClient.post<ResourceQuery>(this.search_resource_url, query);
    console.log("The Result is: " + result);
    return result;
  }

}
