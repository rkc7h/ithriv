import { Links } from './links';
import { Resource } from './resource';
import { Category } from './category';

export interface CategoryResource {
  id: number;
  category_id: number;
  resource: Resource;
  category: Category;
  _links: Links;
}
