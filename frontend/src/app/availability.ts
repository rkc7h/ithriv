import { Institution } from './institution';
import { Links } from './links';

export interface Availability {
  institution: Institution;
  available: boolean;
  links: Links;
}
