import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IfSessionDirective } from './if-session.directive';
import { getDummyUser } from './shared/fixtures/user';
import { MockResourceApiService } from './shared/mocks/resource-api.service.mock';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { User } from './user';

@Component({
  template: `<div id="testComponent"><p *appIfSession id="userFound">User found</p></div>`
})
class TestIfSessionComponent { }

describe('IfSessionDirective', () => {
  let fixture: ComponentFixture<TestIfSessionComponent>;
  let api: MockResourceApiService;
  const user: User = getDummyUser();
  let inputEl: DebugElement;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [
          TestIfSessionComponent,
          IfSessionDirective
        ],
        providers: [
          TemplateRef,
          ViewContainerRef,
          { provide: ResourceApiService, useValue: api }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestIfSessionComponent);
      });
  }));

  it('should create an instance', () => {
    fixture.detectChanges();
    inputEl = fixture.debugElement.query(By.css('#testComponent'));
    expect(inputEl).toBeTruthy();
  });

  it('should hide element if no user is available', () => {
    fixture.detectChanges();
    const userFoundEl = fixture.debugElement.query(By.css('#userFound'));
    expect(userFoundEl).toBeNull();
  });

  it('should show element if user is logged in', () => {
    api.spyAndReturnFake('getSession', user);
    fixture.detectChanges();
    const userFoundEl = fixture.debugElement.query(By.css('#userFound'));
    expect(userFoundEl).toBeTruthy();
  });
});
