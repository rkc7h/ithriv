import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
          BrowserAnimationsModule,
          MatPaginatorModule,
          MatSortModule,
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
        api.spyAndReturnFake('findUsers', [getDummyUser()]);
        fixture = TestBed.createComponent(UserAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
