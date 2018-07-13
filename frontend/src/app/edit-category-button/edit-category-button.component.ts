import { Component, OnInit, Input } from '@angular/core';
import { Category } from '../category';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-edit-category-button',
  templateUrl: './edit-category-button.component.html',
  styleUrls: ['./edit-category-button.component.scss']
})
export class EditCategoryButtonComponent implements OnInit {
  @Input() category: Category;
  @Input() parent: Category;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openEdit() {
    this.dialog.open(CategoryFormComponent, {
      data: { 'edit': this.category, 'parent_category': this.parent }
    });
  }
}
