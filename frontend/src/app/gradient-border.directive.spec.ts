import { Component, ElementRef, Renderer2, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GradientBorderDirective } from './gradient-border.directive';

class MockElementRef extends ElementRef { nativeElement = {}; constructor() { super(null); } }

@Component({
  template: `<div [appGradientBorder]="'#123456'"></div>`
})
class TestGradientBorderComponent { }

describe('GradientBorderDirective', () => {
  const el = new MockElementRef();
  let renderer2: Renderer2;
  let fixture: ComponentFixture<TestGradientBorderComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          TestGradientBorderComponent,
          GradientBorderDirective
        ],
        providers: [
          { provide: ElementRef, useClass: MockElementRef },
          Renderer2
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestGradientBorderComponent);
        renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
      });
  }));

  it('should create an instance', () => {
    const directive = new GradientBorderDirective(el, renderer2);
    expect(directive).toBeTruthy();
  });
});
