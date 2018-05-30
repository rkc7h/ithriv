import {Links} from './links';

export interface Category {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
  children?: Category[];
  _links?: Links;
}
