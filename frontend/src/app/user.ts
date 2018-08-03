import {Links} from './links';

export interface User {
  id: number;
  uid?: string;
  email: string;
  display_name: string;
  password: string;
  _links?: Links;
}
