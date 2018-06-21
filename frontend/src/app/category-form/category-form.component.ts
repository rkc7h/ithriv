import { Component, Inject, OnInit } from '@angular/core';
import { ResourceApiService } from '../resource-api.service';
import { Category } from '../category';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  isDataLoaded = false;
  createNew = false;
  categoryForm: FormGroup;
  name: FormControl;
  description: FormControl;
  brief_description: FormControl;
  icon: FormControl;
  category: Category;
  showConfirmDelete = false;
  error: string;

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
    this.name = new FormControl([Validators.required, Validators.maxLength(256)]);
    this.description = new FormControl([Validators.required, Validators.minLength(20)]);
    this.brief_description = new FormControl([Validators.required, Validators.minLength(20),
    Validators.maxLength(200)]);
    this.icon = new FormControl();

    console.log('The category name ' + this.category.name);

    this.categoryForm = new FormGroup({
      name: this.name,
      description: this.description
    });

    this.name.patchValue(this.category.name);
    this.description.patchValue(this.category.description);
    this.brief_description.patchValue(this.category.brief_description);
    this.icon.patchValue(this.category.icon);

    //    this.name.valueChanges.subscribe(t => this.category.name = t);
    //    this.description.valueChanges.subscribe(t => this.category.description = t);

    this.isDataLoaded = true;
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.category.name = this.name.value;
      this.category.description = this.description.value;
      this.category.brief_description = this.brief_description.value;
      this.category.icon = this.icon.value;
      if (this.createNew) {
        this.api.addCategory(this.category).subscribe(c => {
          this.category = c;
          if (this.data.parent_category) {
            this.data.parent_category.children.push(this.category);
          }
          this.dialogRef.close();
        });
      } else {
        this.api.updateCategory(this.category).subscribe(c => {
          this.category = c;
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
    // Get list of icons from service URL
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

  // Replaces underscores with spaces and capitalizes each word in given string
  getLabel(s) {
    return s.split('_').map(w => w[0].toUpperCase() + w.substr(1)).join(' ');
  }
}
