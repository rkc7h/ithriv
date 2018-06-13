import { TestBed, inject } from '@angular/core/testing';

import { ResourceApiService } from './resource-api.service';

describe('ResourceApiService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceApiService]
    });
  });

  it('should be created', inject([ResourceApiService], (service: ResourceApiService) => {
    expect(service).toBeTruthy();
  }));

});
