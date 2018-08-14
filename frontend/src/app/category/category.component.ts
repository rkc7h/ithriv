import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { CategoryResource } from '../category-resource';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';
import { hexColorToRGBA } from '../shared/color';
import {collectExternalReferences} from "@angular/compiler";

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
  publicId: number;
  user: User;

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
    this.publicId = 87;
    this.loadUser();
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

  loadUser() {
    this.api._getSession().subscribe(s => {
      this.user = s;
    });
  }

  getResources(institutionId?: number) {
    return this.categoryResources.filter(cr => {
      const isApproved = this.user ? true : cr.resource.approved;
      if (Number.isFinite(institutionId)) {
        return isApproved && cr.resource.availabilities.some(av => {
          return (av.institution_id === institutionId) && av.available;
        });
      } else {
        return isApproved && cr.resource.availabilities.some(av => {
          return (av.institution_id === this.publicId) && av.available;
        });
      }
    }).map(cr => cr.resource);
  }

  getAllResources() {
    return this.categoryResources.filter(cr => {
      return this.user ? true : cr.resource.approved;
    }).map(cr => cr.resource);
  }

  // Returns current user's name, or "public" if user is not logged in.
  getUserName() {
    return this.user ? this.user.display_name : 'the public';
  }

  // Returns current user's institution_id, or Public institution_id
  // if user is not logged in.
  getInstitutionId() {
    return this.user ? this.user.institution_id : this.publicId;
  }

  ngOnInit() {
  }

  goMode($event, category: Category) {
    $event.preventDefault();
    if (category.level === 0) {
      this.router.navigate(['browse', category.id]);
    } else if (category.level === 1) {
      this.router.navigate(['category', category.id, 'network']);
    }
  }

  categoryImageURL() {
    const rootCat = this.category && this.category.parent && this.category.parent.parent;
    if (rootCat) {
      return `url('/assets/browse/${rootCat.image.replace('.png', '')}-tile.png')`;
    }
  }

  categoryColorLight() {
    return hexColorToRGBA(this.category.color, 0.1);
  }

}
