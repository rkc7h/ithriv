import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { UserResourceListComponent } from './user-resource-list.component';

describe('UserResourceListComponent', () => {
  let api: MockResourceApiService;
  let component: UserResourceListComponent;
  let fixture: ComponentFixture<UserResourceListComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [UserResourceListComponent],
      providers: [
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
