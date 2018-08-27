import { Links } from './links';

export interface ResourceAttachment {
  id: number;
  resource_id?: number;
  attachment_id?: number;
  _links?: Links;
}
