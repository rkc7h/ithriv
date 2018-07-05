import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Category } from '../category';
import { ResourceFormComponent } from '../resource-form/resource-form.component';

@Component({
  selector: 'app-add-resource-button',
  templateUrl: './add-resource-button.component.html',
  styleUrls: ['./add-resource-button.component.scss']
})
export class AddResourceButtonComponent implements OnInit {
  @Input() category: Category;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openAdd() {
    this.dialog.open(ResourceFormComponent, {
      data: { 'parent_category': this.category }
    });
  }
}
