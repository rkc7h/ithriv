import { FormControl, FormGroup } from '@angular/forms';
import { Category } from './category';

export class FormField {
  formControl?: FormControl;
  formGroup?: FormGroup;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  placeholder: string;
  type: string;
  options?: object;
  showIcons = false;
  multiSelect = false;
  fieldsetId?: string;
  fieldsetLabel?: string;

  // 'select' type can pull from a hard-coded list
  // or from API. If selectOptions is not provided,
  // apiSource will be used.
  selectOptions?: string[];
  apiSource?: string; // Should be the name of the API function to call

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}

