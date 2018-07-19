import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { CategoryResource } from '../category-resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categoryId: number;
  category: Category;
  categoryResources: CategoryResource[];
  isDataLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private titleService: Title
  ) {

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

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.category.name}`);
      }
    );
  }

  loadResources() {
    this.api.getCategoryResources(this.category).subscribe(
      (categoryResources) => {
        this.categoryResources = categoryResources;
        this.isDataLoaded = true;
      }
    );
  }

  resources() {
    const resources = [];
    for (const categoryResource of this.categoryResources) {
      resources.push(categoryResource.resource);
    }
    return resources;
  }

  ngOnInit() {
  }

}
