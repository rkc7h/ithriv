import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { CategoryFormComponent } from './category-form.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [CategoryFormComponent],
        imports: [
          MatDialogModule,
          FormsModule,
          ReactiveFormsModule
        ],
        providers: [
          { provide: ResourceApiService, useClass: MockResourceApiService },
          {
            provide: MatDialogRef, useValue: {
              close: (dialogResult: any) => { },
              updateSize: (dialogResult: any) => { },
            }
          },
          { provide: MAT_DIALOG_DATA, useValue: [] },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CategoryFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
