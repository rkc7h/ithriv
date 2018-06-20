import { Links } from './links';

export interface Category {
  id: number;
  name: string;
  description: string;
  brief_description?: string;
  image?: string;
  icon?: string;
  color?: string;
  parent_id?: number;
  children?: Category[];
  _links?: Links;
}
