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
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [routerTransition()],
})
export class SearchComponent implements OnInit {
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
    this.doSearch();
    this.searchBox = new FormControl();
    this.searchForm = new FormGroup({
      searchBox: this.searchBox
    });

    this.searchBox.setValue(this.resourceQuery.query);
    this.searchBox.valueChanges.pipe(
      debounceTime(300)).subscribe(query => {
        this.resourceQuery.query = query;
        this.doSearch();
      });
  }

  loadUser() {
    this.api._getSession().subscribe(s => {
      this.user = s;
    });
  }

  updateQuery(query) {
    this.resourceQuery.query = query;
    this.resourceQuery.start = 0;
    this.doSearch();
  }

  doSearch() {
    this.api.searchResources(this.resourceQuery).subscribe(
      (query) => {
        this.resourceQuery = query;
        this.resources = query.resources;
        this.checkWindowWidth();
      }
    );
    (<any>window).gtag('event', this.resourceQuery.query, {
      'event_category': 'search'
    });
  }

  onScroll() {
    console.log('Scrolled!');
    if (this.loading) { return; }

    if (this.resources != null && this.resources.length === this.resourceQuery.total) {
      return;
    }
    console.log('finding more resources....');
    this.loading = true;
    const scrollSearch = this.resourceQuery;
    scrollSearch.start = this.resources.length;
    this.api.searchResources(scrollSearch).subscribe(
      (query) => {
        this.resources = this.resources.concat(query.resources);
        this.loading = false;
      }
    );
  }

  addFilter(field: string, value: string) {
    this.resourceQuery.filters.push({ field: field, value: value });
    this.showFilters = false;
    this.resourceQuery.start = 0;
    this.doSearch();
  }

  removeFilter(filter: Filter) {
    const index = this.resourceQuery.filters.indexOf(filter, 0);
    if (index > -1) {
      this.resourceQuery.filters.splice(index, 1);
    }
    this.showFilters = false;
    this.resourceQuery.start = 0;
    this.doSearch();
  }

  getAllResources() {
    return this.resources.filter(r => {
      return this.user ? true : r.approved;
    });
  }
}
