import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { ResourceApiService } from '../resource-api.service';

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
    private api: ResourceApiService
  ) {

    this.route.params.subscribe(params => {
      this.categoryId = params['category'];
      this.loadCategory(this.categoryId);
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

  goCategory($event, category) {
    $event.preventDefault();
    this.router.navigate(['category', category]);
  }

  ngOnInit() {
  }

  headerImage() {
    return `url('assets/browse/${this.category.image}')`;
  }

  headerGradient() {
    return `linear-gradient(to right, ${this.category.color}FF, ${this.category.color}FF 50%, ${this.category.color}00 75%)`;
  }

  categoryIcon(c) {
    if (c.icon) {
      return `ithriv_${c.icon.replace('.svg', '')}`;
    }
  }

}
