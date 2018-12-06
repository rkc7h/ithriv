import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeComponent } from './node.component';
import { InlineSVGDirective } from 'ng-inline-svg';
import { MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { NodeOptions } from '../../node-options';
import { getDummyCategory } from '../../shared/fixtures/category';

describe('NodeComponent', () => {
  let component: NodeComponent;
  let fixture: ComponentFixture<NodeComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          InlineSVGDirective,
          NodeComponent
        ],
        imports: [
          MatTooltipModule,
          RouterTestingModule.withRoutes([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(NodeComponent);
        component = fixture.componentInstance;
        component.options = new NodeOptions({
          relationship: 'self',
          x: 0,
          y: 0,
          radius: 80,
          angle: 0,
          titleHeight: 40
        });

        component.category = getDummyCategory();
        component.numTotal = 1;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
