import { Links } from './links';

export interface User {
  id: number;
  uid?: string;
  email: string;
  display_name: string;
  password?: string;
  role: string;
  institution_id?: number;
  _links?: Links;
}
