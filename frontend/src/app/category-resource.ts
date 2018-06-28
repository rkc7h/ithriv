import { Availability } from './availability';
import { Institution } from './institution';
import { Links } from './links';
import { ResourceType } from './resourceType';
import { Type } from '@angular/compiler/src/output/output_ast';
import {Resource} from './resource';
import {Category} from './category';

export interface CategoryResource {
  id: number;
  resource: Resource;
  category: Category;
  _links?: Links;
}
