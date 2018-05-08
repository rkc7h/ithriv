import {Links} from './links';

export interface Resource {

  id: number;
  name: '';
  description: '';
  type: '';
  institution: '';
  website: '';
  owner: '';
  links: Links;
}
