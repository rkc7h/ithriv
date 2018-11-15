import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteResourceButtonComponent } from './favorite-resource-button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FavoriteResourceButtonComponent', () => {
  let component: FavoriteResourceButtonComponent;
  let fixture: ComponentFixture<FavoriteResourceButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteResourceButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteResourceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
