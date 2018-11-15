import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryComponent } from './category.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [CategoryComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
