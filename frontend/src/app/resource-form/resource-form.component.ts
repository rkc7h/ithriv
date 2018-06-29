import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent implements OnInit {
  category: Category;
  createNew = false;
  error: string;
  errorMatcher = new ErrorMatcher();
  isDataLoaded = false;
  resource: Resource;
  resourceForm: FormGroup;
  showConfirmDelete = false;

  // Form Fields
  fields = {
    name: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 140,
      minLength: 1,
      placeholder: 'Name',
      type: 'text'
    }),
    description: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 500,
      minLength: 20,
      placeholder: 'Description',
      type: 'textarea'
    }),
    owner: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Owner',
      type: 'text'
    }),
    website: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Website',
      type: 'text'
    }),
  };

  constructor(
    private api: ResourceApiService,
    public dialogRef: MatDialogRef<ResourceFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.dialogRef.updatePosition({
      top: '100px',
    });

    if (this.data.edit) {
      this.createNew = false;
      this.resource = this.data.edit;
    } else {
      this.createNew = true;
      this.resource = { id: null, name: '', description: '' };
    }

    if (this.data.parent_category) {
      this.category = this.data.parent_category;
    }
    this.loadForm();
  }

  ngOnInit() {
  }

  loadForm() {
    const formGroup = {};
    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        const validators = [];

        if (this.fields[fieldName].required) {
          validators.push(Validators.required);
        }

        if (this.fields[fieldName].minLength) {
          validators.push(Validators.minLength(this.fields[fieldName].minLength));
        }

        if (this.fields[fieldName].maxLength) {
          validators.push(Validators.maxLength(this.fields[fieldName].maxLength));
        }

        this.fields[fieldName].formControl.patchValue(this.resource[fieldName]);
        // this[fieldName].valueChanges.subscribe(t => this.resource[fieldName] = t);
        this.fields[fieldName].formControl.setValidators(validators);
        formGroup[fieldName] = this.fields[fieldName].formControl;
      }
    }

    this.resourceForm = new FormGroup(formGroup);
    this.isDataLoaded = true;
  }

  onSubmit() {
    if (this.resourceForm.valid) {
      this.isDataLoaded = false;

      for (const fieldName in this.fields) {
        if (this.fields.hasOwnProperty(fieldName)) {
          this.resource[fieldName] = this.fields[fieldName].formControl.value;
        }
      }

      if (this.createNew) {
        this.api.addResource(this.resource).subscribe(r => {
          this.resource = r;
          if (this.data.parent_category) {
            this.api.linkResourceAndCategory(this.resource, this.category).subscribe();
          }
          this.dialogRef.close();
        });
      } else {
        this.api.updateResource(this.resource).subscribe(r => {
          this.resource = r;
          this.dialogRef.close();
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  showDelete() {
    this.showConfirmDelete = true;
  }

  onDelete() {
    this.api.deleteResource(this.resource).subscribe(r => {
      this.dialogRef.close();
    },
      error => this.error = error
    );
  }
}
