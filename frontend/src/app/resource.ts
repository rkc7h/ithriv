import { Availability } from './availability';
import { Institution } from './institution';
import { Links } from './links';
import { ResourceType } from './resourceType';

export interface Resource {
  id: number;
  name: string;
  description: string;
  owner?: string;
  contact_email?: string;
  contact_notes?: string;
  contact_phone?: string;
  cost?: string;
  institution_id?: number;
  type_id?: number;
  website?: string;
  approved?: boolean;
  last_updated?: string;
  availabilities?: Availability[];
  institution?: Institution;
  type?: ResourceType;
  _links?: Links;
}
