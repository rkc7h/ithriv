import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryButtonComponent } from './add-category-button.component';
import { MatIconModule, MatDialogModule } from '@angular/material';

describe('AddCategoryButtonComponent', () => {
  let component: AddCategoryButtonComponent;
  let fixture: ComponentFixture<AddCategoryButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddCategoryButtonComponent],
      imports: [
        MatDialogModule,
        MatIconModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCategoryButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
