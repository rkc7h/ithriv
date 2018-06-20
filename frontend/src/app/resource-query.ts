import { Resource } from './resource';

export interface ResourceQuery {
  query: string;
  filters: Array<Filter>;
  facets: Array<Facet>;
  total: number;
  size: number;
  start: number;
  resources: Array<Resource>;
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
