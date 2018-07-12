import { Links } from './links';
import { Category } from './category';

export interface ResourceCategory {
  id: number;
  category: Category;
  _links: Links;
}
