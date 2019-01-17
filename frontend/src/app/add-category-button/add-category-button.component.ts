import { Component, OnInit, Input } from '@angular/core';
import { Category } from '../category';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatDialog } from '@angular/material';
import { User } from '../user';

@Component({
  selector: 'app-add-category-button',
  templateUrl: './add-category-button.component.html',
  styleUrls: ['./add-category-button.component.scss']
})
export class AddCategoryButtonComponent implements OnInit {
  @Input() category: Category;
  @Input() user: User;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openAdd() {
    this.dialog.open(CategoryFormComponent, {
      data: { 'parent_category': this.category }
    });
  }
}
