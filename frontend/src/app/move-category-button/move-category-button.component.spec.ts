import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCategoryButtonComponent } from './move-category-button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MoveCategoryButtonComponent', () => {
  let component: MoveCategoryButtonComponent;
  let fixture: ComponentFixture<MoveCategoryButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MoveCategoryButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCategoryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
