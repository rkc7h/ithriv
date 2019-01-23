import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Resource } from '../resource';
import { ResourceQuery } from '../resource-query';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {

  @Input() resources: Resource[];
  @Input() user: User;
  @Input() resourceQuery: ResourceQuery;
  @Input() sidenavExpanded: boolean;
  csvDataReady = false;
  preparingCsvData = false;
  csvData = [];
  redactFields = [
    '_links',
    'owner',
    'contact_email',
    'contact_phone',
    'type_id',
    'institution_id'
  ];
  breakpoint: string;

  constructor(
    private api: ResourceApiService,
    public breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
    this.breakpointObserver
      .observe([
        Breakpoints.XLarge,
        Breakpoints.Large,
        Breakpoints.Medium,
        Breakpoints.Small,
        Breakpoints.XSmall
      ])
      .subscribe((state: BreakpointState) => {
        if (state.breakpoints[Breakpoints.XLarge]) { this.breakpoint = 'xl'; }
        if (state.breakpoints[Breakpoints.Large]) { this.breakpoint = 'lg'; }
        if (state.breakpoints[Breakpoints.Medium]) { this.breakpoint = 'md'; }
        if (state.breakpoints[Breakpoints.Small]) { this.breakpoint = 'sm'; }
        if (state.breakpoints[Breakpoints.XSmall]) { this.breakpoint = 'xs'; }
      });
  }

  getCsvKeys(resources: Resource[]): string[] {
    if (resources && (resources.length > 0)) {
      return Object
        .keys(resources[0])
        .filter(k => !this.redactFields.includes(k))
        .sort();
    } else {
      return [];
    }
  }

  getCsvOptions() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: false,
      showTitle: false,
      title: this.getCsvFilename().toUpperCase(),
      useBom: false,
      removeNewLines: true,
      headers: [],
      keys: []
    };

    if (this.resources && (this.resources.length > 0)) {
      const keys = this.getCsvKeys(this.resources);
      csvOptions.headers = keys;
      csvOptions.keys = keys;
    }
    return csvOptions;
  }

  getCsvFilename() {
    const d = new Date();
    return `resources - ${d.toISOString().slice(0, 19)}`;
  }

  getCsvData() {
    this.preparingCsvData = true;

    // If this is the search screen, get all unpaginated data from api.
    if (this.resourceQuery) {

      // Clone the search query
      const csvQuery = new ResourceQuery(this.resourceQuery);

      // Get all available results
      csvQuery.start = 0;
      csvQuery.size = csvQuery.total;

      // Fetch the data from the backend
      this.api.searchResources(csvQuery).subscribe(query => {
        const data = this.prepareCsvData(query.resources);
        this.csvData = data;
        this.csvDataReady = true;
        this.preparingCsvData = false;
      });

    } else {
      // Otherwise, just get data from the list resources displayed.
      const data = this.prepareCsvData(this.resources);

      window.setTimeout(() => {
        this.csvData = data;
        this.csvDataReady = true;
        this.preparingCsvData = false;
      }, 1000);
    }
  }

  prepareCsvData(resources: Resource[]) {
    if (!resources || resources.length === 0) { return []; }
    const keys = this.getCsvKeys(resources);

    return resources.map(r => {
      const returnObj = {};

      for (const key of keys) {
        if (r.hasOwnProperty(key)) {
          const val = r[key];

          if (key === 'availabilities') {
            returnObj[key] = val
              .filter(a => a.available)
              .map(a => a.institution.name)
              .join('; ');
          } else if (key === 'resource_categories') {
            returnObj[key] = val
              .map(rc => rc.category.name)
              .join('; ');
          } else if (Array.isArray(val)) {
            returnObj[key] = val.join('; ');

            if ((val.length > 0) && (typeof val[0] === 'string')) {
              returnObj[key] = val.join('; ');
            } else if ((val.length > 0) && (typeof val[0] === 'object')) {
              returnObj[key] = val.map(f => f.name || f.url || f.id || '').join('; ');
            } else {
              returnObj[key] = '';
            }
          } else if (val && (typeof val === 'object')) {
            returnObj[key] = val.name || val.id || '';
          } else {
            returnObj[key] = val || '';
          }
        }
      }
      return returnObj;
    });
  }
}
