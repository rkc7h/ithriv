import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldLabelComponent } from './form-field-label.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FormFieldLabelComponent', () => {
  let component: FormFieldLabelComponent;
  let fixture: ComponentFixture<FormFieldLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormFieldLabelComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
