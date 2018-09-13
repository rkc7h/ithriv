import { Links } from './links';
import { Resource } from './resource';

export interface Favorite {
  id: number;
  user_id: number;
  resource_id: number;
  resource?: Resource;
  _links?: Links;
}
