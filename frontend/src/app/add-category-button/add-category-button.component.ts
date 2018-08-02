import { Component, OnInit, Input } from '@angular/core';
import { Category } from '../category';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatDialog } from '@angular/material';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";

@Component({
  selector: 'app-add-category-button',
  templateUrl: './add-category-button.component.html',
  styleUrls: ['./add-category-button.component.scss']
})
export class AddCategoryButtonComponent implements OnInit {
  @Input() category: Category;

  constructor(
    private dialog: MatDialog,
    private api: ResourceApiService
  ) { }

  ngOnInit() {
  }

  openAdd() {
    this.dialog.open(CategoryFormComponent, {
      data: { 'parent_category': this.category }
    });
  }

  getSession() {
    return this.api.session;
  }

}
