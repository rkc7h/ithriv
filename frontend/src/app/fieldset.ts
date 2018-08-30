import { FormField } from './form-field';

export class Fieldset {
  id: string;
  label: string;
  fields: FormField[] = [];

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}
