import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { InlineSVGDirective } from 'ng-inline-svg';
import { MockResourceApiService } from '../../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../../shared/resource-api/resource-api.service';
import { NodeComponent } from '../node/node.component';
import { GraphComponent } from './graph.component';

describe('GraphComponent', () => {
  let api: MockResourceApiService;
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [
        GraphComponent,
        NodeComponent,
        InlineSVGDirective
      ],
      imports: [
        MatTooltipModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
