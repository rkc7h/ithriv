import { Institution } from './institution';
import { Links } from './links';

export interface Availability {
  institution: Institution;
  viewable: boolean;
  available: boolean;
  links: Links;
}
