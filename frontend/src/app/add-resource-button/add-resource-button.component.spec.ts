import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResourceButtonComponent } from './add-resource-button.component';

describe('AddResourceButtonComponent', () => {
  let component: AddResourceButtonComponent;
  let fixture: ComponentFixture<AddResourceButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddResourceButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResourceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
