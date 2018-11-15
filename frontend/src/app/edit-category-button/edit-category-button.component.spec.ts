import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCategoryButtonComponent } from './edit-category-button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditCategoryButtonComponent', () => {
  let component: EditCategoryButtonComponent;
  let fixture: ComponentFixture<EditCategoryButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCategoryButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCategoryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
