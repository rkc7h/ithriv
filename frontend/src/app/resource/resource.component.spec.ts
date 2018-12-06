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

interface ComponentOptions {
  makePrivate?: boolean;
  userMayView?: boolean;
  userMayEdit?: boolean;
}

describe('ResourceComponent', () => {
  let api: MockResourceApiService;
  let component: ResourceComponent;
  let fixture: ComponentFixture<ResourceComponent>;

  const getDummyData = function (options: ComponentOptions) {
    const resource = getDummyResource();
    resource.private = options.makePrivate;
    resource.user_may_view = options.userMayView;
    resource.user_may_edit = options.userMayEdit;

    const user = getDummyUser();
    user.role = options.userMayEdit ? 'Admin' : 'User';

    api.spyAndReturnFake('getResource', resource);
    api.spyAndReturnFake('getSession', user);
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
    const options: ComponentOptions = {
      makePrivate: false,
      userMayView: true,
      userMayEdit: false
    };

    getDummyData(options);
    expect(component).toBeTruthy();
  });

  it('should show non-private resource', () => {
    const options: ComponentOptions = {
      makePrivate: false,
      userMayView: true,
      userMayEdit: false
    };

    getDummyData(options); // Non-private resource, general user
    const el = fixture.debugElement.query(By.css('.resource')).nativeElement;
    expect(el.hasAttribute('hidden')).toEqual(false);
  });

  it('should mark private resource', () => {
    const options: ComponentOptions = {
      makePrivate: true,
      userMayView: true,
      userMayEdit: false
    };

    getDummyData(options);
    const classes = fixture.debugElement.query(By.css('.resource')).classes;
    expect(classes.private).toEqual(true);
  });

  it('should hide private resource', () => {
    const options: ComponentOptions = {
      makePrivate: true,
      userMayView: false,
      userMayEdit: false
    };

    getDummyData(options);
    const el = fixture.debugElement.query(By.css('.resource')).nativeElement;
    expect(el.hasAttribute('hidden')).toEqual(true);
  });

  it('should toggle private resource to non-private if non-private button is clicked', () => {
    const options: ComponentOptions = {
      makePrivate: true,
      userMayView: true,
      userMayEdit: true
    };

    getDummyData(options);
    spyOn(component, 'togglePrivate');

    const btn: HTMLElement = fixture.debugElement.nativeElement.querySelector('#button-not-private');
    expect(btn).toBeTruthy();
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.togglePrivate).toHaveBeenCalledWith(false);
    });
  });

  it('should toggle non-private resource to private if private button is clicked', async () => {
    const options: ComponentOptions = {
      makePrivate: false,
      userMayView: true,
      userMayEdit: true
    };

    getDummyData(options);
    spyOn(component, 'togglePrivate');

    const btn: HTMLElement = fixture.debugElement.nativeElement.querySelector('#button-private');
    expect(btn).toBeTruthy();
    btn.click();

    fixture.whenStable().then(() => {
      expect(component.togglePrivate).toHaveBeenCalledWith(true);
    });
  });
});
