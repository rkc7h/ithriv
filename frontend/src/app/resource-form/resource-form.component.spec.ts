import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of as observableOf } from 'rxjs';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceFormComponent } from './resource-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getDummyCategory } from '../shared/fixtures/category';

describe('ResourceFormComponent', () => {
  let api: MockResourceApiService;
  let component: ResourceFormComponent;
  let fixture: ComponentFixture<ResourceFormComponent>;
  const category = getDummyCategory();

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [ResourceFormComponent],
        imports: [
          BrowserAnimationsModule,
          FormsModule,
          MatSnackBarModule,
          ReactiveFormsModule,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              params: observableOf({ email_token: 'skhjdfklhafljkhljkhafdkadshfk' }),
            }
          },
          { provide: ResourceApiService, useValue: api }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        api.spyAndReturnFake('getCategories', [category]);
        fixture = TestBed.createComponent(ResourceFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a checkbox for private resource', () => {
    expect(component.fields.hasOwnProperty('private')).toBeTruthy();
    expect(component.fields.private.type).toEqual('checkbox');
  });
});
