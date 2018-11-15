import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeSelectComponent } from './tree-select.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TreeSelectComponent', () => {
  let component: TreeSelectComponent;
  let fixture: ComponentFixture<TreeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TreeSelectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
