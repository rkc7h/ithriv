import { CUSTOM_ELEMENTS_SCHEMA, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of as observableOf } from 'rxjs';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let api: MockResourceApiService;
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [LoginFormComponent],
        imports: [
          BrowserAnimationsModule,
          FormsModule,
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
        fixture = TestBed.createComponent(LoginFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
