import {Component, Inject, OnInit} from '@angular/core';
import {ResourceApiService} from '../resource-api.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CategoryFormComponent} from '../category-form/category-form.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Resource} from '../resource';
import {Category} from '../category';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.css']
})
export class ResourceFormComponent implements OnInit {

  isDataLoaded = false;
  createNew = false;
  resourceForm: FormGroup;
  name: FormControl;
  description: FormControl;
  owner: FormControl;
  website: FormControl;
  resource: Resource;
  showConfirmDelete = false;
  error: string;
  category: Category;

  constructor(private api: ResourceApiService,
              public dialogRef: MatDialogRef<CategoryFormComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) {
    if (this.data.edit) {
      this.createNew = false;
      this.resource = this.data.edit;
    } else {
      this.createNew = true;
      this.resource = {id: null, name: '', description: ''};
    }

    if (this.data.parent_category) {
        this.category = this.data.parent_category;
    }
    this.loadForm();
  }

  ngOnInit() {
  }

  loadForm() {
    this.name = new FormControl([Validators.required, Validators.maxLength(256)]);
    this.description = new FormControl([Validators.required, Validators.minLength(20)]);
    this.owner = new FormControl([Validators.required, Validators.minLength(20)]);
    this.website = new FormControl([Validators.required, Validators.minLength(20)]);

    this.resourceForm = new FormGroup( {
      name: this.name,
      description: this.description,
      owner: this.owner,
      website: this.website
    });

    this.name.patchValue(this.resource.name);
    this.description.patchValue(this.resource.description);
    this.owner.patchValue(this.resource.owner);
    this.website.patchValue(this.resource.website);
    this.isDataLoaded = true;
  }

  onSubmit() {
    if (this.resourceForm.valid) {
      this.resource.name = this.name.value;
      this.resource.description = this.description.value;
      this.resource.owner = this.owner.value;
      this.resource.website = this.website.value;
      if (this.createNew) {
        this.api.addResource(this.resource).subscribe(c => {
          this.resource = c;
          if (this.data.parent_category) {
            this.api.linkResourceAndCategory(this.resource, this.category).subscribe();
          }
          this.dialogRef.close();
        });
      } else {
        this.api.updateResource(this.resource).subscribe(c => {
          this.resource = c;
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
    this.api.deleteResource(this.resource).subscribe(c => {
       this.dialogRef.close();
      },
      error => this.error = error
    );
  }
}
