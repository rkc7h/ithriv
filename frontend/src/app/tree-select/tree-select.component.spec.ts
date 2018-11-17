import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule, MatTreeModule } from '@angular/material';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { TreeSelectComponent } from './tree-select.component';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { FormField } from '../form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TreeSelectComponent', () => {
  let api: MockResourceApiService;
  let component: TreeSelectComponent;
  let fixture: ComponentFixture<TreeSelectComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [TreeSelectComponent],
        imports: [
          FormsModule,
          MatBadgeModule,
          MatTreeModule,
          ReactiveFormsModule,
          BrowserAnimationsModule
        ],
        providers: [
          { provide: ResourceApiService, useValue: api }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TreeSelectComponent);
        component = fixture.componentInstance;
        component.field = new FormField({
          formGroup: new FormGroup({}),
          required: true,
          placeholder: 'Yub Nub',
          type: 'tree',
          apiSource: 'getCategories',
          multiSelect: true
        });
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
