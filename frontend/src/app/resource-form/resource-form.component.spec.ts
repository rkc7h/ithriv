import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceFormComponent } from './resource-form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ResourceFormComponent', () => {
  let component: ResourceFormComponent;
  let fixture: ComponentFixture<ResourceFormComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [ResourceFormComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
