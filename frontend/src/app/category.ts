import {Links} from './links';

export interface Category {
  id: number;
  name: string;
  description: string;
  children: Category[];
  _links: Links;
}
