import {Component, Inject, OnInit} from '@angular/core';
import {ResourceApiService} from '../resource-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Category} from '../category';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  isDataLoaded = false;
  categoryForm: FormGroup;
  name: FormControl;
  description: FormControl;
  category: Category;

  constructor(private api: ResourceApiService,
              public dialogRef: MatDialogRef<CategoryFormComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) {
      console.log('The category id is ' + JSON.stringify(this.data.category.name));
      this.category = this.data.category;
      this.loadForm();
  }

  ngOnInit() {
  }

  loadForm() {
    this.name = new FormControl([Validators.required, Validators.maxLength(256)]);
    this.description = new FormControl([Validators.required, Validators.minLength(20)]);

    console.log('The category name ' + this.category.name)


    this.categoryForm = new FormGroup( {
      name: this.name,
      description: this.description
    })

    this.name.patchValue(this.category.name);
    this.description.patchValue(this.category.description);

//    this.name.valueChanges.subscribe(t => this.category.name = t);
//    this.description.valueChanges.subscribe(t => this.category.description = t);

    this.isDataLoaded = true;
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.category.name = this.name.value;
      this.category.description = this.description.value;
      this.api.updateCategory(this.category).subscribe(c => {
        this.category = c;
        this.dialogRef.close();
      });
    }
  }

  onReset() {
    this.name.patchValue(this.category.name);
    this.description.patchValue(this.category.description);
  }

}
