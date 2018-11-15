import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResourceButtonComponent } from './edit-resource-button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditResourceButtonComponent', () => {
  let component: EditResourceButtonComponent;
  let fixture: ComponentFixture<EditResourceButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditResourceButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResourceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
