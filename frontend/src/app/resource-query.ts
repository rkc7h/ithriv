import { Resource } from './resource';

export class ResourceQuery {
  query: string;
  filters: Array<Filter>;
  facets: Array<Facet>;
  total: number;
  size: number;
  start: number;
  sort?: string;
  resources: Array<Resource>;

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}

export interface Filter {
  field: string;
  value: string;
}

export interface Facet {
  field: string;
  facetCounts: Array<FacetCount>;
}

export interface FacetCount {
  category: string;
  hit_count: number;
  is_selected: boolean;
}
