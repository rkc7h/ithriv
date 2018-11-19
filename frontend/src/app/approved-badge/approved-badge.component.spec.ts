import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material';
import { Resource } from '../resource';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ApprovedBadgeComponent } from './approved-badge.component';
import { getDummyResource } from '../shared/fixtures/resource';

describe('ApprovedBadgeComponent', () => {
  let component: ApprovedBadgeComponent;
  let fixture: ComponentFixture<ApprovedBadgeComponent>;
  let api: MockResourceApiService;
  const resource: Resource = getDummyResource();

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [ApprovedBadgeComponent, MatTooltip],
      providers: [
        { provide: ResourceApiService, useClass: MockResourceApiService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ApprovedBadgeComponent);
        component = fixture.debugElement.componentInstance;
        component.resource = resource;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
