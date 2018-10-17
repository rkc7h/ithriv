import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Resource } from '../resource';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {

  @Input() resources: Resource[];
  @Input() sidenavExpanded: boolean;

  constructor() { }

  ngOnInit() {
  }

  getCsvOptions() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: false,
      showTitle: true,
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
    const data = this.resources.map(r => {
      const returnObj = {};

      for (const fieldname in r) {
        if (r.hasOwnProperty(fieldname) && (fieldname !== '_links')) {
          if (fieldname === 'availabilities') {
            returnObj[fieldname] = r[fieldname]
              .filter(a => a.available)
              .map(a => a.institution.name)
              .join('; ');
          } else if (fieldname === 'resource_categories') {
            returnObj[fieldname] = r[fieldname]
              .map(rc => rc.category.name)
              .join('; ');
          } else if (Array.isArray(r[fieldname])) {
            returnObj[fieldname] = r[fieldname].join('; ');

            if ((r[fieldname].length > 0) && (typeof r[fieldname][0] === 'string')) {
              returnObj[fieldname] = r[fieldname].join('; ');
            } else if ((r[fieldname].length > 0) && (typeof r[fieldname][0] === 'object')) {
              returnObj[fieldname] = r[fieldname].map(f => f.name || f.url || f.id || '').join('; ');
            } else {
              returnObj[fieldname] = '';
            }
          } else if (r[fieldname] && (typeof r[fieldname] === 'object')) {
            returnObj[fieldname] = r[fieldname].name || r[fieldname].id || '';
          } else {
            returnObj[fieldname] = r[fieldname];
          }
        }
      }

      return returnObj;
    });

    return data;
  }
}
