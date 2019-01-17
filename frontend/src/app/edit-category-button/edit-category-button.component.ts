import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Category } from '../category';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { MatDialog } from '@angular/material';
import { User } from '../user';

@Component({
  selector: 'app-edit-category-button',
  templateUrl: './edit-category-button.component.html',
  styleUrls: ['./edit-category-button.component.scss']
})
export class EditCategoryButtonComponent implements OnInit {
  @Input() category: Category;
  @Input() user: User;
  @Input() parent: Category;
  @Output() updatedCategory: EventEmitter<Category> = new EventEmitter();

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openEdit() {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      data: { 'edit': this.category, 'parent_category': this.parent }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.updatedCategory.emit(result);
    });
  }

}
