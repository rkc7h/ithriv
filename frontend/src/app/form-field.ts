import { FormControl, FormGroup } from '@angular/forms';
import { FileAttachment } from './file-attachment';

export class FormField {
  fieldsetId?: string;
  fieldsetLabel?: string;
  formControl?: FormControl;
  formGroup?: FormGroup;
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  multiSelect = false;
  options?: object;
  placeholder: string;
  required?: boolean;
  showIcons = false;
  type:
    'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' |
    'files' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' |
    'range' | 'reset' | 'richtexteditor' | 'search' | 'select' | 'submit' |
    'tel' | 'text' | 'time' | 'tree' | 'url' | 'week';

  // 'files' type
  attachments = new Map<string, FileAttachment>();

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

