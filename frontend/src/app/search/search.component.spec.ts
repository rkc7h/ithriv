import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSidenavModule,
  MatTooltipModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of as observableOf } from 'rxjs';
import { CategoryTileComponent } from '../category-tile/category-tile.component';
import { GradientBorderDirective } from '../gradient-border.directive';
import { Resource } from '../resource';
import { ResourceListComponent } from '../resource-list/resource-list.component';
import { ResourceQuery } from '../resource-query';
import { getDummyResource } from '../shared/fixtures/resource';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let api: MockResourceApiService;
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  const resources: Resource[] = [getDummyResource()];

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [
        SearchComponent,
        ResourceListComponent,
        CategoryTileComponent,
        GradientBorderDirective
      ],
      imports: [
        BrowserAnimationsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatSidenavModule,
        MatTooltipModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: observableOf({ query: '' }),
          }
        },
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    api.setResponse(resources);
    api.searchResourcesSpy(() => fixture.detectChanges());

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    component.resourceQuery = new ResourceQuery({
      query: '',
      filters: [],
      facets: [],
      total: 0,
      size: 0,
      start: 0,
      resources: [],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
