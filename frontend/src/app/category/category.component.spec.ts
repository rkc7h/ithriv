import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { Category } from '../category';
import { getDummyCategory } from '../shared/fixtures/category';
import { MockMarkdownService } from '../shared/mocks/markdown.service.mock';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { CategoryComponent } from './category.component';
import { getDummyResource } from '../shared/fixtures/resource';
import { CategoryResource } from '../category-resource';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let api: MockResourceApiService;
  const category: Category = getDummyCategory();
  const categoryResources: CategoryResource[] = [{
    id: 0,
    category_id: category.id,
    resource: getDummyResource(),
    category: category,
    _links: { collection: '', self: '' }
  }];

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [CategoryComponent],
        imports: [
          BrowserAnimationsModule,
          MarkdownModule,
          MatTooltipModule,
          RouterTestingModule.withRoutes([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: ResourceApiService, useValue: api },
          { provide: MarkdownService, useClass: MockMarkdownService },
        ]
      })
      .compileComponents()
      .then(() => {
        api.spyAndReturnFake('getCategory', category);
        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        component.categoryResources = categoryResources;
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
