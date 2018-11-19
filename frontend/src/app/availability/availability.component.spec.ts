import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailabilityComponent } from './availability.component';
import { getDummyResource } from '../shared/fixtures/resource';
import { Resource } from '../resource';

describe('AvailabilityComponent', () => {
  let component: AvailabilityComponent;
  let fixture: ComponentFixture<AvailabilityComponent>;
  const resource: Resource = getDummyResource();

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [AvailabilityComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AvailabilityComponent);
        component = fixture.componentInstance;
        component.resource = resource;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
