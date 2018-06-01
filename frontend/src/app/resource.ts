import {Links} from './links';
import {Availability} from './availability';
import {Institution} from './institution';

export interface Resource {

  id: number;
  name: '';
  description: '';
  type?: '';
  institution?: Institution;
  website?: '';
  owner?: '';
  availabilities?: Availability[];
  _links?: Links;
}
