import { Links } from './links';

export interface ResourceCategory {
  id: number;
  resource_id: number;
  category_id: number;
  _links: Links;
}
