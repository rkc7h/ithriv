import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldComponent } from './form-field.component';
import { MatSelectModule, MatFormFieldModule, MatCardModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormFieldComponent],
      imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatCardModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
