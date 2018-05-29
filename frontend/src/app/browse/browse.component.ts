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
        this.loadCategory(this.categoryId);
    });
  }


  loadCategory(categoryId: Number) {
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;
        this.isDataLoaded = true;
      }
    );
  }

  openEdit(category: Category) {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '250px',
      data: {category}
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
