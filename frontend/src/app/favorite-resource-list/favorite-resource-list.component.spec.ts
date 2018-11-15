import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteResourceListComponent } from './favorite-resource-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FavoriteResourceListComponent', () => {
  let component: FavoriteResourceListComponent;
  let fixture: ComponentFixture<FavoriteResourceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FavoriteResourceListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
