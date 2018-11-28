import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { CategoryColorBorderDirective } from '../category-color-border.directive';
import { getDummyResource } from '../shared/fixtures/resource';
import { getDummyUser } from '../shared/fixtures/user';
import { MockMarkdownService } from '../shared/mocks/markdown.service.mock';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceComponent } from './resource.component';
import { getDummyCategory } from '../shared/fixtures/category';
import { By } from '@angular/platform-browser';

describe('ResourceComponent', () => {
  let api: MockResourceApiService;
  let component: ResourceComponent;
  let fixture: ComponentFixture<ResourceComponent>;

  const getDummyData = function (makePrivate = false) {
    const resource = getDummyResource();
    resource.private = makePrivate;

    api.spyAndReturnFake('getResource', resource);
    api.spyAndReturnFake('getSession', getDummyUser());
    api.spyAndReturnFake('getResourceCategories', [{
      id: 0,
      category_id: 123,
      resource_id: 999,
      category: getDummyCategory()
    }]);

    fixture = TestBed.createComponent(ResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [
          CategoryColorBorderDirective,
          ResourceComponent
        ],
        imports: [
          BrowserAnimationsModule,
          MarkdownModule,
          MatTooltipModule,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          { provide: ResourceApiService, useValue: api },
          { provide: MarkdownService, useClass: MockMarkdownService },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  it('should create', () => {
    getDummyData(false);
    expect(component).toBeTruthy();
  });

  it('should show non-private resource', () => {
    getDummyData(false);
    const el = fixture.debugElement.query(By.css('.resource')).nativeElement;
    expect(el.hasAttribute('hidden')).toEqual(false);
  });

  it('should hide private resource', () => {
    getDummyData(true);
    const el = fixture.debugElement.query(By.css('.resource')).nativeElement;
    expect(el.hasAttribute('hidden')).toEqual(true);
  });
});
