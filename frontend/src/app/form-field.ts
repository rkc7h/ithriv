import { FormControl } from '@angular/forms';

export class FormField {
  formControl: FormControl;
  required: Boolean;
  maxLength: Number;
  minLength: Number;
  placeholder: String;
  type: String;
  icons: [String];

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}

