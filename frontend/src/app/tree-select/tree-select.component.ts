import { SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material';
import { of as observableOf } from 'rxjs';
import { Category } from '../category';
import { FormField } from '../form-field';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { fadeTransition } from '../shared/animations';

@Component({
  selector: 'app-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  animations: [fadeTransition()]
})
export class TreeSelectComponent implements OnInit {
  @Input() field: FormField;
  @HostBinding('@fadeTransition')
  categories: Category[] = [];
  treeControl: NestedTreeControl<Category>;
  dataSource: MatTreeNestedDataSource<Category>;
  dataLoaded = false;
  nodes = {};

  /** The selection for checklist */
  checklistSelection = new SelectionModel<Category>(true /* multiple */);

  constructor(private api: ResourceApiService) {
    this.treeControl = new NestedTreeControl<Category>(node => observableOf(node.children));
    this.dataSource = new MatTreeNestedDataSource();
    this.api.getCategories().subscribe(categories => {
      this.dataSource.data = categories;
      this.categories = categories;
      this.updateSelection();
    });
  }

  ngOnInit() {
  }

  updateSelection() {
    if (
      this.field &&
      this.field.formGroup &&
      this.field.formGroup.controls
    ) {
      const controls = this.field.formGroup.controls;

      for (const key in this.nodes) {
        if (this.nodes.hasOwnProperty(key) && controls.hasOwnProperty(key)) {
          if (controls[key].value) {
            this.checklistSelection.select(this.nodes[key]);
          } else {
            this.checklistSelection.deselect(this.nodes[key]);
          }
        }
      }

      this.dataLoaded = true;
    }
  }

  getFormControl(node: Category) {
    const key = node.id.toString();
    this.nodes[key] = node;

    if (this.field.formGroup.controls.hasOwnProperty(key)) {
      return this.field.formGroup.controls[key];
    } else {
      console.log('Could not find control with key:', key);
    }
  }

  hasNestedChild = (_: number, node: Category) => {
    return (node.children && (node.children.length > 0));
  }

  getChildren = (node: Category): Category[] => node.children;

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: Category): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: Category): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  numSelectedDescendants(node: Category): number {
    const descendants: Category[] = this.treeControl.getDescendants(node);
    const selectedDescendants = descendants.filter(d => this.checklistSelection.isSelected(d));
    return selectedDescendants.length;
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  toggleNode(node: Category): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  toggleExpand($event, node: Category): void {
    $event.preventDefault();
  }
}
