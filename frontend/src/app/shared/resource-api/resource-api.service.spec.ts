import { inject, TestBed } from '@angular/core/testing';
import { ResourceApiService } from './resource-api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ResourceApiService', () => {

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        providers: [ResourceApiService],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      });
  });

  it('should be created', inject([ResourceApiService], (service: ResourceApiService) => {
    expect(service).toBeTruthy();
  }));

});
