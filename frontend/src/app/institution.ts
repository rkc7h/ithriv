import { Links } from './links';

export interface Institution {
  id: number;
  name: string;
  description?: string;
  links?: Links;
}
