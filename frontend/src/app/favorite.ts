import {Links} from "./links";

export interface Favorite {
  id: number;
  user_id: number;
  resource_id: number;
  _links?: Links;
}
