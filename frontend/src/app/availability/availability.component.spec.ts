import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AvailabilityComponent } from './availability.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AvailabilityComponent', () => {
  let component: AvailabilityComponent;
  let fixture: ComponentFixture<AvailabilityComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [AvailabilityComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
