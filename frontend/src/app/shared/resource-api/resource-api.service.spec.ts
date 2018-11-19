import { inject, TestBed } from '@angular/core/testing';
import { ResourceApiService } from './resource-api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MockBackend } from '@angular/http/testing';
import { XHRBackend } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResourceApiService', () => {

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          HttpClientModule,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          ResourceApiService,
          { provide: XHRBackend, useClass: MockBackend }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      });
  });

  it('should be created', inject([ResourceApiService], (service: ResourceApiService) => {
    expect(service).toBeTruthy();
  }));

});
