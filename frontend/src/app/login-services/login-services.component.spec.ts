import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { LoginServicesComponent } from './login-services.component';

describe('LoginServicesComponent', () => {
  let api: MockResourceApiService;
  let component: LoginServicesComponent;
  let fixture: ComponentFixture<LoginServicesComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [LoginServicesComponent],
      imports: [
        MatTooltipModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            routeConfig: { path: 'register' },
          }
        },
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        api.setResponse([
          { id: 1, name: 'UVA' },
          { id: 2, name: 'Carilion' },
          { id: 3, name: 'Virginia Tech' },
          { id: 4, name: 'Inova' },
        ]);
        api.getInstitutionsSpy(() => fixture.detectChanges());
        fixture = TestBed.createComponent(LoginServicesComponent);
        component = fixture.componentInstance;
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
