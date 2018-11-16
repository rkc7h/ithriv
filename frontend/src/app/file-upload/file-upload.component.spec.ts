import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { MatTableModule } from '@angular/material';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { FormField } from '../form-field';
import { FileAttachment } from '../file-attachment';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let api: MockResourceApiService;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [FileUploadComponent],
        imports: [
          FormsModule,
          MatTableModule,
          ReactiveFormsModule
        ],
        providers: [
          { provide: ResourceApiService, useValue: api }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FileUploadComponent);
        component = fixture.componentInstance;
        component.field = new FormField({
          formControl: new FormControl(),
          attachments: new Map<number | string, FileAttachment>(),
          required: false,
          placeholder: 'Attachments',
          type: 'files'
        });
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
