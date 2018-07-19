import { Institution } from './institution';
import { Links } from './links';

export interface Availability {
  id?: number;
  institution_id: number;
  resource_id: number;
  available: boolean;
  institution?: Institution;
  _links?: Links;
}
