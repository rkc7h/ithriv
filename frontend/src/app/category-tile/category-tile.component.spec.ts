import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryTileComponent } from './category-tile.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CategoryTileComponent', () => {
  let component: CategoryTileComponent;
  let fixture: ComponentFixture<CategoryTileComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [CategoryTileComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
