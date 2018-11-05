import { Links } from './links';
import { Icon } from './icon';
import { NodeOptions } from './node-options';

export interface Category {
  brief_description?: string;
  children?: Category[];
  color?: string;
  description: string;
  icon?: Icon;
  icon_id?: string;
  id: number;
  image?: string;
  level: number;
  name: string;
  parent_id?: number;
  parent?: Category;
  _links?: Links;
  resource_count?: number;
  display_order?: number;

  // Presentation options
  options?: NodeOptions;
  hover?: boolean;
  index?: number;
}
