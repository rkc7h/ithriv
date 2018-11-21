import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IfSessionDirective } from './if-session.directive';
import { MockResourceApiService } from './shared/mocks/resource-api.service.mock';
import { ResourceApiService } from './shared/resource-api/resource-api.service';

@Component({
  template: `<div *appIfSession></div>`
})
class TestIfSessionComponent { }

describe('IfSessionDirective', () => {
  let templateRef: TemplateRef<TestIfSessionComponent>;
  let viewContainerRef: ViewContainerRef;
  let fixture: ComponentFixture<TestIfSessionComponent>;
  let api: MockResourceApiService;

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
        templateRef = fixture
          .componentRef
          .injector
          .get<TemplateRef<TestIfSessionComponent>>(TemplateRef as Type<TemplateRef<TestIfSessionComponent>>);
        viewContainerRef = fixture
          .componentRef
          .injector
          .get<ViewContainerRef>(ViewContainerRef as Type<ViewContainerRef>);
      });
  }));

  it('should create an instance', () => {
    const directive = new IfSessionDirective(templateRef, viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
