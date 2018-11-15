import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryButtonComponent } from './add-category-button.component';
import { MatIconModule, MatDialogModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AddCategoryButtonComponent', () => {
  let component: AddCategoryButtonComponent;
  let fixture: ComponentFixture<AddCategoryButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCategoryButtonComponent],
      imports: [
        MatDialogModule,
        MatIconModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCategoryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
