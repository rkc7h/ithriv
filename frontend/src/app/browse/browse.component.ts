import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceApiService} from '../resource-api.service';
import {Category} from '../category';
import {MatDialog} from '@angular/material';
import {CategoryFormComponent} from '../category-form/category-form.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  categoryId = 1;
  isDataLoaded = false;
  category: Category;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private api: ResourceApiService,
              private dialog: MatDialog) {
    this.route.params.subscribe( params => {
        this.categoryId = params['category'];
        if(this.categoryId) {
          this.loadCategory(this.categoryId);
        }
    });
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.loadCategory(category);
  }

  loadCategory(categoryId: Number) {
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;
        this.isDataLoaded = true;
      }
    );
  }

  openEdit(category: Category, parent: Category = null) {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '300px',
      data: {'edit': category, 'parent_category': parent}
    });
  }

  openAdd(category: Category) {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '300px',
      data: {'parent_category': category}
    });
  }


  goCategory($event, category) {
    $event.preventDefault();
    this.router.navigate(['category', category]);
  }

  ngOnInit() {
  }


  header_image() {
    return 'assets/browse/header-' + this.category.name.toLowerCase() + '.png';
  }


}
