import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultRequestFormComponent } from './consult-request-form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ConsultRequestFormComponent', () => {
  let component: ConsultRequestFormComponent;
  let fixture: ComponentFixture<ConsultRequestFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultRequestFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
