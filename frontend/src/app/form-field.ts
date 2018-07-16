import { FormControl, FormGroup } from '@angular/forms';
import { Category } from './category';

export class FormField {
  apiSource: string;
  formControl?: FormControl;
  formGroup?: FormGroup;
  required: boolean;
  maxLength: number;
  minLength: number;
  placeholder: string;
  type: string;
  options: object;
  showIcons = false;
  multiSelect = false;

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}

