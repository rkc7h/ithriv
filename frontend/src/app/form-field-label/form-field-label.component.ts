import { Component, OnInit, Input } from '@angular/core';
import { FormField } from '../form-field';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-field-label',
  templateUrl: './form-field-label.component.html',
  styleUrls: ['./form-field-label.component.scss']
})
export class FormFieldLabelComponent implements OnInit {
  @Input() field: FormField;
  @Input() errors: ValidationErrors;

  constructor() { }

  ngOnInit() {
  }

  isValid(field: FormField) {
    if (field.formControl) {
      return field.formControl.valid;
    } else if (field.formGroup) {
      return field.formGroup.valid;
    } else {
      return true;
    }
  }
}

