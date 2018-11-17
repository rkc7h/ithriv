import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { getDummyUser } from '../shared/fixtures/user';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { UserAdminComponent } from './user-admin.component';

describe('UserAdminComponent', () => {
  let api: MockResourceApiService;
  let component: UserAdminComponent;
  let fixture: ComponentFixture<UserAdminComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [UserAdminComponent],
        imports: [
          MatTableModule,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          { provide: ResourceApiService, useValue: api }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        api.setResponse([getDummyUser()]);
        api.findUsersSpy(() => fixture.detectChanges());
        fixture = TestBed.createComponent(UserAdminComponent);
        component = fixture.componentInstance;
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
