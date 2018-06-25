import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceApiService } from '../resource-api.service';
import { ResourceFormComponent } from '../resource-form/resource-form.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categoryId: number;
  category: Category;
  resources: Resource[];
  isDataLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private dialog: MatDialog) {

    this.route.params.subscribe(params => {
      this.categoryId = params['category'];
      this.loadCategory(this.categoryId);
    });
  }

  loadCategory(categoryId: Number) {
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;
        this.loadResources();
      }
    );
  }

  loadResources() {
    this.api.getCategoryResources(this.category).subscribe(
      (resources) => {
        this.resources = resources;
        this.isDataLoaded = true;
      }
    );
  }

  openEdit(resource: Resource, parent: Category = null) {
    const dialogRef = this.dialog.open(ResourceFormComponent, {
      width: '30%',
      data: { 'edit': resource, 'parent_category': parent }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadResources();
    });
  }

  openAdd(parent: Category) {
    const dialogRef = this.dialog.open(ResourceFormComponent, {
      width: '30%',
      data: { 'parent_category': parent }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadResources();
    });
  }

  ngOnInit() {
  }

}
