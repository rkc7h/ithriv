import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceSearchComponent } from './resource-search.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ResourceSearchComponent', () => {
  let component: ResourceSearchComponent;
  let fixture: ComponentFixture<ResourceSearchComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [ResourceSearchComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
