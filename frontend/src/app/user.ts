import {Links} from "./links";

export interface User {
  id: number;
  name: string;
  email_address: string;
  display_name: string;
  password: string;
  _links?: Links;
}
