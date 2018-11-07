import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  category: Category;
  categoryForm: FormGroup;
  createNew = false;
  error: string;
  errorMatcher = new ErrorMatcher();
  isDataLoaded = false;
  showConfirmDelete = false;

  // Form Fields
  fields = {
    name: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Name',
      type: 'text'
    }),
    description: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Description',
      type: 'richtexteditor',
      options: {
        status: ['words']
      }
    }),
    brief_description: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 140,
      minLength: 20,
      placeholder: 'Brief Description',
      type: 'text'
    }),
    image: new FormField({
      formControl: new FormControl(),
      placeholder: 'Image',
      type: 'text'
    }),
    icon: new FormField({
      formControl: new FormControl(),
      placeholder: 'Select Icon',
      type: 'select',
      apiSource: 'getIcons',
      showIcons: true
    }),
    color: new FormField({
      formControl: new FormControl(),
      placeholder: 'Color',
      type: 'color'
    }),
  };

  constructor(
    private api: ResourceApiService,
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    const colWidth = 100 - (1 / 6);
    const parent = this.data.parent_category;
    const level = parent ? (parent.level + 1) : 0;
    this.dialogRef.updateSize(`${colWidth}vw`);

    if (this.data.edit) {
      this.createNew = false;
      this.category = this.data.edit;
    } else {
      this.createNew = true;
      this.category = {
        id: null,
        name: '',
        description: '',
        brief_description: '',
        level: level
      };
      if (this.data.parent_category) {
        this.category.parent_id = this.data.parent_category.id;
      }
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

        this.fields[fieldName].formControl.patchValue(this.category[fieldName]);
        // this[fieldName].valueChanges.subscribe(t => this.category[fieldName] = t);
        this.fields[fieldName].formControl.setValidators(validators);
        formGroup[fieldName] = this.fields[fieldName].formControl;
      }
    }

    this.categoryForm = new FormGroup(formGroup);
    this.isDataLoaded = true;
  }

  getFields(): FormField[] {
    const fields = [];

    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        fields.push(this.fields[fieldName]);
      }
    }

    return fields;
  }

  onSubmit() {
    this.validate();
    this.isDataLoaded = false;

    if (this.categoryForm.valid) {
      for (const fieldName in this.fields) {
        if (this.fields.hasOwnProperty(fieldName)) {
          this.category[fieldName] = this.fields[fieldName].formControl.value;
        }
      }

      if (this.createNew) {
        this.api.addCategory(this.category).subscribe(c => {
          this.category = c;
          if (this.data.parent_category) {
            this.data.parent_category.children.push(this.category);
          }
          this.dialogRef.close(this.category);
          this.isDataLoaded = true;
        });
      } else {
        this.api.updateCategory(this.category).subscribe(c => {
          this.category = c;
          this.dialogRef.close(this.category);
          this.isDataLoaded = true;
        });
      }
    }
  }

  validate() {
    for (const key in this.categoryForm.controls) {
      if (this.categoryForm.controls.hasOwnProperty(key)) {
        const control = this.categoryForm.controls[key];
        control.markAsTouched();
      }
    }
  }

  onCancel() {
    this.dialogRef.close(this.category);
  }

  showDelete() {
    this.showConfirmDelete = true;
  }

  onDelete() {
    this.api.deleteCategory(this.category).subscribe(c => {
      if (this.data.parent_category) {
        const index = this.data.parent_category.children.indexOf(this.category, 0);
        if (index > -1) {
          this.data.parent_category.children.splice(index, 1);
        }
      }
      this.dialogRef.close(this.category);
    },
      error => this.error = error
    );
  }
}
