import { Availability } from './availability';
import { Favorite } from './favorite';
import { Institution } from './institution';
import { Links } from './links';
import { ResourceType } from './resourceType';
import { ResourceCategory } from './resource-category';
import { ResourceAttachment } from './resource-attachment';

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
  approved?: string;
  attachments?: ResourceAttachment[];
  last_updated?: string;
  favorites?: Favorite[];
  availabilities?: Availability[];
  institution?: Institution;
  type?: ResourceType;
  _links?: Links;
  resource_categories?: ResourceCategory[];
}
