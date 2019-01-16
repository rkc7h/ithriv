import {
  AfterViewInit,
  Component,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInput, MatPaginator, MatSidenav } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { Category } from '../category';
import { Resource } from '../resource';
import { Filter, ResourceQuery } from '../resource-query';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
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
  user: User;

  showFilters = false;
  searchForm: FormGroup;
  searchBox: FormControl;
  loading = true;
  hideResults = true;
  resources: Resource[];
  categories: Category[];
  publicId: number;
  pageSize = 20;

  @ViewChild('sidenav') public sideNav: MatSidenav;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { read: MatInput }) public searchInput: MatInput;

  constructor(
    private api: ResourceApiService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.resources = [];
    this.categories = [];
    this.publicId = 87;

    this.api.getSession().subscribe(user => this.user = user);

    this.api.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
      }
    );

    this.route.queryParamMap.subscribe(qParams => {
      let query = '';
      const filters: Filter[] = [];

      for (const key of qParams.keys) {
        if (key === 'query') {
          query = qParams.get(key);
        } else {
          filters.push({ field: key, value: qParams.get(key) });
        }
      }

      this.resourceQuery = new ResourceQuery({
        query: query,
        filters: filters,
        facets: [],
        total: 0,
        size: this.pageSize,
        start: 0,
        resources: [],
        sort: '_score'
      });
    });

    this.renderer.listen(window, 'resize', (event) => {
      this.checkWindowWidth();
    });
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

    this.searchInput.focus();
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

  updateQuery(query) {
    this.hideResults = false;
    this.resourceQuery.query = query;
    this.resourceQuery.start = 0;
    this.paginator.firstPage();
    this.doSearch();
  }

  updateUrl(query: ResourceQuery) {
    const queryArray: string[] = [];

    if (query.hasOwnProperty('query') && query.query) {
      queryArray.push(`query=${query.query}`);
    }

    for (const filter of query.filters) {
      queryArray.push(`${filter.field}=${filter.value}`);
    }

    const url = queryArray.length > 0 ? `/search/filter?${queryArray.join('&')}` : '/search';
    this.router.navigateByUrl(url);

  }

  doSearch() {
    this.loading = true;

    this.hideResults = (
      (this.resourceQuery.query === '') &&
      (this.resourceQuery.filters.length === 0)
    );

    this.updateUrl(this.resourceQuery);

    this.api.searchResources(this.resourceQuery).subscribe(
      (query) => {
        this.loading = false;
        this.resourceQuery = query;
        this.resources = query.resources;
        this.checkWindowWidth();
      }
    );
    if ((<any>window).gtag) {
      (<any>window).gtag('event', this.resourceQuery.query, {
        'event_category': 'search'
      });
    }
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
