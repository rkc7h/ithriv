import { Links } from './links';
import {Institution} from './institution';

export interface User {
  id: number;
  uid?: string;
  email: string;
  display_name: string;
  password?: string;
  role: string;
  institution_id?: number;
  institution?: Institution;
  _links?: Links;
}
