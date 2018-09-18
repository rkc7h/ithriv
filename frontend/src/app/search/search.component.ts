import { Component, Input, OnInit, Renderer2, ViewChild, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatSidenav } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Filter, ResourceQuery } from '../resource-query';
import { fadeTransition } from '../shared/animations';
import { User } from '../user';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [fadeTransition()],
})
export class SearchComponent implements OnInit {
  @HostBinding('@fadeTransition')
  @Input() resourceQuery: ResourceQuery;

  showFilters = false;

  searchForm: FormGroup;
  searchBox: FormControl;
  loading = false;
  resources: Resource[];
  categories: Category[];
  publicId: number;
  user: User;
  pageSize = 20;

  @ViewChild('sidenav') public sideNav: MatSidenav;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private api: ResourceApiService,
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
      const filter = ('field' && 'value' in params ? [{ field: params['field'], value: params['value'] }] : [] );
      this.resourceQuery = { query: query, filters: filter, facets: [], total: 0, size: this.pageSize, start: 0, resources: [], sort: '_score' };
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
        this.updateQuery(query);
      });
  }

  loadUser() {
    this.api.getSession().subscribe(s => {
      this.user = s;
    });
  }

  updateQuery(query) {
    this.resourceQuery.query = query;
    this.resourceQuery.start = 0;
    this.paginator.firstPage();
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

  sortByDate() {
    this.resourceQuery.sort = '-last_updated';
    this.showFilters = false;
    this.resourceQuery.start = 0;
    this.doSearch();
  }

  sortByRelevance() {
    this.resourceQuery.sort = '_score';
    this.showFilters = false;
    this.resourceQuery.start = 0;
    this.doSearch();
  }

  addFilter(field: string, value: string) {
    this.resourceQuery.filters.push({ field: field, value: value });
    this.showFilters = false;
    this.resourceQuery.start = 0;
    this.paginator.firstPage();
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

  updatePage() {
    this.resourceQuery.size = this.paginator.pageSize;
    this.resourceQuery.start = (this.paginator.pageIndex * this.paginator.pageSize) + 1;
    this.doSearch();
  }

}
