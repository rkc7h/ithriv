import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCategoryButtonComponent } from './move-category-button.component';

describe('MoveCategoryButtonComponent', () => {
  let component: MoveCategoryButtonComponent;
  let fixture: ComponentFixture<MoveCategoryButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MoveCategoryButtonComponent]
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
