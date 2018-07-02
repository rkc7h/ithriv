import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ValidateUrl } from '../shared/validators/url.validator';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss']
})
export class ResourceFormComponent implements OnInit {
  category: Category;
  createNew = false;
  errors: string[];
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
      type: 'url'
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
    if (!this.createNew) {
      this.validate();
    }
  }

  loadForm() {
    const formGroup = {};
    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        const field = this.fields[fieldName];

        const validators = [];

        if (field.required) {
          validators.push(Validators.required);
        }

        if (field.minLength) {
          validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength) {
          validators.push(Validators.maxLength(field.maxLength));
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        if (field.type === 'url') {
          validators.push(ValidateUrl);
        }

        field.formControl.patchValue(this.resource[fieldName]);
        // this[fieldName].valueChanges.subscribe(t => this.resource[fieldName] = t);
        field.formControl.setValidators(validators);
        formGroup[fieldName] = field.formControl;
      }
    }

    this.resourceForm = new FormGroup(formGroup);
    this.isDataLoaded = true;
  }

  onSubmit() {
    this.validate();
    this.errors = [];

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
    } else {
      console.log('this.resourceForm.errors', this.resourceForm.errors);
      for (const key in this.resourceForm.errors) {
        if (this.resourceForm.errors.hasOwnProperty(key)) {
          this.errors.push = this.resourceForm.errors[key];
        }
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  validate() {
    for (const key in this.resourceForm.controls) {
      if (this.resourceForm.controls.hasOwnProperty(key)) {
        const control = this.resourceForm.controls[key];
        control.markAsTouched();
      }
    }
  }

  showDelete() {
    this.showConfirmDelete = true;
  }

  onDelete() {
    this.errors = [];

    this.api.deleteResource(this.resource).subscribe(r => {
      this.dialogRef.close();
    },
      error => this.errors.push(error)
    );
  }
}
