import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResourceListComponent } from './user-resource-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('UserResourceListComponent', () => {
  let component: UserResourceListComponent;
  let fixture: ComponentFixture<UserResourceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserResourceListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
