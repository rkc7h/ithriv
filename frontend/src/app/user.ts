import { Links } from './links';

export interface User {
  id: number;
  uid?: string;
  email: string;
  display_name: string;
  password: string;
  institution_id?zz: number;
  _links?: Links;
}
