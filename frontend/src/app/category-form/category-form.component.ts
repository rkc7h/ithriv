import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { Category } from '../category';
import { ResourceApiService } from '../resource-api.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class ErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  isDataLoaded = false;
  createNew = false;
  categoryForm: FormGroup;
  category: Category;

  // Form Fields
  fields = {
    name: {
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Name',
      type: 'text'
    },
    description: {
      formControl: new FormControl(),
      required: true,
      maxLength: 500,
      minLength: 20,
      placeholder: 'Description',
      type: 'text'
    },
    brief_description: {
      formControl: new FormControl(),
      required: true,
      maxLength: 140,
      minLength: 20,
      placeholder: 'Brief Description',
      type: 'textarea'
    },
    image: {
      formControl: new FormControl(),
      placeholder: 'Image',
      type: 'text'
    },
    icon: {
      formControl: new FormControl(),
      placeholder: 'Icon',
      type: 'selectIcon',
      icons: this.allIcons(),
    },
    color: {
      formControl: new FormControl(),
      placeholder: 'Color',
      type: 'text'
    },
  };

  showConfirmDelete = false;
  error: string;
  errorMatcher = new ErrorMatcher();

  constructor(
    private api: ResourceApiService,
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.dialogRef.updatePosition({
      top: '100px',
    });

    if (this.data.edit) {
      this.createNew = false;
      this.category = this.data.edit;
    } else {
      this.createNew = true;
      this.category = { id: null, name: '', description: '' };
      if (this.data.parent_category) {
        this.category.parent_id = this.data.parent_category.id;
      }
    }
    this.loadForm();
  }

  ngOnInit() {
  }

  loadForm() {
    console.log('this.category', this.category);

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

  onSubmit() {
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
          this.dialogRef.close();
          this.isDataLoaded = true;
        });
      } else {
        this.api.updateCategory(this.category).subscribe(c => {
          this.category = c;
          this.dialogRef.close();
          this.isDataLoaded = true;
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
    this.api.deleteCategory(this.category).subscribe(c => {
      if (this.data.parent_category) {
        const index = this.data.parent_category.children.indexOf(this.category, 0);
        if (index > -1) {
          this.data.parent_category.children.splice(index, 1);
        }
      }
      this.dialogRef.close();
    },
      error => this.error = error
    );
  }

  allIcons() {

    // !!! TO DO
    // Get list of icons from icon service URL
    return [
      'admin_tools',
      'ancillary_service',
      'center',
      'certificate',
      'clinical_translational',
      'communicate',
      'community',
      'data_management',
      'data_science',
      'design',
      'facility',
      'funding',
      'grant',
      'grants',
      'logistics',
      'management',
      'participate',
      'regulations',
      'research_reg',
      'special_topic',
      'training',
      'writing'
    ];
  }
}
