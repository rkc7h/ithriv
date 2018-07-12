import { Availability } from './availability';
import { Institution } from './institution';
import { Links } from './links';
import { ResourceType } from './resourceType';

export interface Resource {
  id: number;
  name: string;
  description: string;
  type?: ResourceType;
  institution?: Institution;
  institution_id?: number;
  website?: string;
  owner?: string;
  availabilities?: Availability[];
  _links?: Links;
}
