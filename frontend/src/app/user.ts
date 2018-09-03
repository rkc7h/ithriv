import { Links } from './links';
import {Institution} from './institution';

export interface User {
  id: number;
  eppn?: string;
  email: string;
  display_name: string;
  password?: string;
  role: string;
  institutional_role?: string;
  division?: string;
  institution_id?: number;
  institution?: Institution;
  _links?: Links;
}
