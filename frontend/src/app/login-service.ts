export class LoginService {
  id: number;
  color: string;
  name: string;
  image: string;
  url?: string;

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}
