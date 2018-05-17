import {Links} from './links';

export interface Category {
  id: Number;
  name: String;
  description: String;
  children: Category[];
  links: Links;
}
