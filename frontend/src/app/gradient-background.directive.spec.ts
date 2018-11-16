import { Component, ElementRef, Renderer2, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GradientBackgroundDirective } from './gradient-background.directive';

class MockElementRef extends ElementRef { nativeElement = {}; constructor() { super(null); } }

@Component({
  template: `<div [appGradientBackground]="'#654321'"></div>`
})
class TestGradientBackgroundComponent { }

describe('GradientBackgroundDirective', () => {
  const el = new MockElementRef();
  let renderer2: Renderer2;
  let fixture: ComponentFixture<TestGradientBackgroundComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          TestGradientBackgroundComponent,
          GradientBackgroundDirective
        ],
        providers: [
          { provide: ElementRef, useClass: MockElementRef },
          Renderer2
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestGradientBackgroundComponent);
        renderer2 = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
      });
  }));

  it('should create an instance', () => {
    const directive = new GradientBackgroundDirective(el, renderer2);
    expect(directive).toBeTruthy();
  });
});
