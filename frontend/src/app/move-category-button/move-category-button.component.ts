import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Category } from '../category';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-move-category-button',
  templateUrl: './move-category-button.component.html',
  styleUrls: ['./move-category-button.component.scss']
})
export class MoveCategoryButtonComponent implements OnInit {
  @Input() category: Category;
  @Input() user: User;
  @Input() siblings: Category[];
  @Input() direction: string;
  @Output() updatedCategory: EventEmitter<Category> = new EventEmitter();

  constructor(private api: ResourceApiService) { }

  ngOnInit() { }

  moveUp($event) {
    $event.preventDefault();
    $event.stopPropagation();

    const currentIndex = this.siblings.findIndex(c => c.id === this.category.id);
    const isAlreadyFirst = (currentIndex <= 0);

    // Reset display order of all categories to sequential integers
    this.siblings.forEach((child, i) => {
      if (!isAlreadyFirst) {
        if (i === currentIndex - 1) {
          child.display_order = i + 1;
        } else if (i === currentIndex) {
          child.display_order = i - 1;
        } else {
          child.display_order = i;
        }
      } else {
        child.display_order = i;
      }

      this.api.updateCategory(child).subscribe(c => this.updatedCategory.emit(c));
    });
  }

  moveDown($event) {
    $event.preventDefault();
    $event.stopPropagation();

    const currentIndex = this.siblings.findIndex(c => c.id === this.category.id);
    const isAlreadyLast = (currentIndex >= this.siblings.length - 1);

    // Reset display order of all categories to sequential integers
    this.siblings.forEach((child, i) => {
      if (!isAlreadyLast) {
        if (i === currentIndex + 1) {
          child.display_order = i - 1;
        } else if (i === currentIndex) {
          child.display_order = i + 1;
        } else {
          child.display_order = i;
        }
      } else {
        child.display_order = i;
      }

      this.api.updateCategory(child).subscribe(c => this.updatedCategory.emit(c));
    });
  }
}
