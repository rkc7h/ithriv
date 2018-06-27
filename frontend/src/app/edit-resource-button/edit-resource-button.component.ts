import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceFormComponent } from '../resource-form/resource-form.component';

@Component({
  selector: 'app-edit-resource-button',
  templateUrl: './edit-resource-button.component.html',
  styleUrls: ['./edit-resource-button.component.scss']
})
export class EditResourceButtonComponent implements OnInit {
  @Input() resource: Resource;
  @Input() category: Category;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  openEdit() {
    this.dialog.open(ResourceFormComponent, {
      width: '30%',
      data: { 'edit': this.resource, 'parent_category': this.category }
    });
  }

}
