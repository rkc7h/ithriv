import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { CategoryResource } from '../category-resource';
import { zoomTransition } from '../shared/animations';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  animations: [zoomTransition()]
})
export class CategoryComponent implements OnInit {
  categoryId: number;
  category: Category;
  categoryResources: CategoryResource[];
  transitionClass = '';
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
        this.transitionClass = 'zoom-in-enter';
        this.isDataLoaded = true;
      }
    );
  }

  loadUser() {
    this.api.getSession().subscribe(user => {
      this.user = user;
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

  // Returns current user's name, the session institution_name, or "the public" if a user is not logged in
  // and there is no session institution set.
  getUserName() {
    if (this.user) {
      return this.user.display_name;
    } else if (sessionStorage.getItem('institution_name')) {
      return sessionStorage.getItem('institution_name');
    } else {
      return 'the public';
    }
  }

  // Returns current user's institution_id, the session institution_id, or Public institution_id
  // if a user is not logged in and there is no session institution set.
  getInstitutionId() {
    if (this.user) {
      return this.user.institution_id;
    } else if (sessionStorage.getItem('institution_id')) {
      return parseInt(sessionStorage.getItem('institution_id'), 10);
    } else {
      return this.publicId;
    }
  }

  ngOnInit() {
  }

  goCategory($event, category: Category) {
    $event.preventDefault();
    this.transitionClass = 'zoom-out-exit';

    if (category.level === 2) {
      this.router.navigate(['category', category.id], { queryParams: { from: this.category.level } });
    } else if (this.api.getViewPreferences().isNetworkView) {
      this.router.navigate(['network', category.id]);
    } else {
      const id = (category.level === 1) ? category.parent.id : category.id;
      const scrollTo = (category.level === 1) ? category.id : undefined;
      const queryParams = { from: this.category.level, scrollTo: scrollTo };
      this.router.navigate(['browse', id], { queryParams: queryParams });
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
