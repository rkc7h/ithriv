import { FormControl } from '@angular/forms';

export class FormField {
  formControl: FormControl;
  required: boolean;
  maxLength: number;
  minLength: number;
  placeholder: string;
  type: string;
  icons: [string];

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}

