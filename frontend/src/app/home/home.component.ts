import { Component, Input, OnInit, Renderer2, ViewChild, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Filter, ResourceQuery } from '../resource-query';
import { routerTransition } from '../shared/router.animations';
import { User } from '../user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [routerTransition()],
})
export class HomeComponent implements OnInit {
  @HostBinding('@routerTransition')
  @Input() resourceQuery: ResourceQuery;

  showFilters = false;

  searchForm: FormGroup;
  searchBox: FormControl;
  loading = false;
  resources: Resource[];
  categories: Category[];
  publicId: number;
  user: User;

  @ViewChild('sidenav') public sideNav: MatSidenav;

  constructor(
    private api: ResourceApiService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {
    this.loadUser();
    this.resources = [];
    this.categories = [];
    this.publicId = 87;

    this.api.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
      }
    );

    this.route.params.subscribe(params => {
      const query = ('query' in params ? params['query'] : '');
      this.resourceQuery = { query: query, filters: [], facets: [], total: 0, size: 20, start: 0, resources: [] };
    });
    this.renderer.listen(window, 'resize', (event) => {
      this.checkWindowWidth();
    });
  }

  private checkWindowWidth(): void {
    if (window.innerWidth > 768) {
      this.sideNav.mode = 'side';
      this.sideNav.opened = false;
    } else {
      this.sideNav.mode = 'over';
      this.sideNav.opened = false;
    }
  }

  ngOnInit() {
    this.searchBox = new FormControl();
    this.searchForm = new FormGroup({
      searchBox: this.searchBox
    });
  }

  loadUser() {
    this.api._getSession().subscribe(s => {
      this.user = s;
    });
  }

  goSearch() {
    this.router.navigate(['search', this.searchBox.value]);
  }

  getResources(institutionId?: number) {
    return this.resources.filter(r => {
      const isApproved = this.user ? true : r.approved;

      if (Number.isFinite(institutionId)) {
        return isApproved && r.availabilities.some(av => {
          return (av.institution_id === institutionId) && av.available;
        });
      } else {
        return isApproved && r.availabilities.some(av => {
          return (av.institution_id === this.publicId) && av.available;
        });
      }
    });
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
}
