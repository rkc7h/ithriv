import { Links } from './links';

export interface Category {
  brief_description?: string;
  children?: Category[];
  color?: string;
  description: string;
  icon?: string;
  icon_id?: string;
  id: number;
  image?: string;
  level: number;
  name: string;
  parent_id?: number;
  parent?: Category;
  _links?: Links;
}
