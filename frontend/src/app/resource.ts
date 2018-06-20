import { Availability } from './availability';
import { Institution } from './institution';
import { Links } from './links';
import { ResourceType } from './resourceType';
import { Type } from '@angular/compiler/src/output/output_ast';

export interface Resource {
  id: number;
  name: '';
  description: '';
  type?: ResourceType;
  institution?: Institution;
  website?: '';
  owner?: '';
  availabilities?: Availability[];
  _links?: Links;
}
