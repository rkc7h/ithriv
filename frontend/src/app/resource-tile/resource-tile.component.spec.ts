import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { CategoryColorBorderDirective } from '../category-color-border.directive';
import { getDummyCategory } from '../shared/fixtures/category';
import { getDummyResource } from '../shared/fixtures/resource';
import { MockMarkdownService } from '../shared/mocks/markdown.service.mock';
import { ResourceTileComponent } from './resource-tile.component';
import { By } from '@angular/platform-browser';

interface ComponentOptions {
  makePrivate?: boolean;
  userMayView?: boolean;
  userMayEdit?: boolean;
}

describe('ResourceTileComponent', () => {
  let component: ResourceTileComponent;
  let fixture: ComponentFixture<ResourceTileComponent>;

  const getDummyData = function (options: ComponentOptions) {
    fixture = TestBed.createComponent(ResourceTileComponent);
    component = fixture.componentInstance;

    const resource = getDummyResource();
    resource.private = options.makePrivate;
    resource.user_may_edit = options.userMayView;
    resource.user_may_view = options.userMayEdit;
    resource.resource_categories = [{
      id: 0,
      category_id: 123,
      resource_id: 999,
      category: getDummyCategory(),
      _links: null
    }];
    component.resource = resource;

    fixture.detectChanges();
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ResourceTileComponent,
        CategoryColorBorderDirective
      ],
      imports: [
        MarkdownModule,
        MatTooltipModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: MarkdownService, useClass: MockMarkdownService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  it('should create', () => {
    const options: ComponentOptions = {
      makePrivate: false,
      userMayEdit: false,
      userMayView: true
    };

    getDummyData(options);
    expect(component).toBeTruthy();
  });

  it('should mark private resource', () => {
    const options: ComponentOptions = {
      makePrivate: true,
      userMayEdit: true,
      userMayView: true
    };
    getDummyData(options);
    const classes = fixture.debugElement.query(By.css('.resource')).classes;
    expect(classes.private).toEqual(true);
  });

});
