import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceQuery } from '../resource-query';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {

  @Input() resources: Resource[];
  @Input() resourceQuery: ResourceQuery;
  @Input() sidenavExpanded: boolean;
  csvDataReady = false;
  preparingCsvData = false;
  csvData = [];

  constructor(private api: ResourceApiService) { }

  ngOnInit() {
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
      for (const fieldname in this.resources[0]) {
        if (this.resources[0].hasOwnProperty(fieldname) && (fieldname !== '_links')) {
          csvOptions.headers.push(fieldname);
          csvOptions.keys.push(fieldname);
        }
      }
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
    return resources.map(r => {
      const returnObj = {};

      for (const key in r) {
        if (r.hasOwnProperty(key) && (key !== '_links')) {
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
