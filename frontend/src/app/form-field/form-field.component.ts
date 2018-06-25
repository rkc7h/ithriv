import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit {
  @Input() field;
  @Input() errorMatcher: ErrorStateMatcher;
  @Input() formGroup: FormGroup;

  constructor() {
  }

  ngOnInit() {
  }

  currentLength() {
    return (
      this.field &&
      this.field.formControl &&
      this.field.formControl.value &&
      this.field.formControl.value.length
    ) || 0;
  }

  // Replaces underscores with spaces and capitalizes each word in given string
  getLabel(s) {
    return s.split('_').map(w => w[0].toUpperCase() + w.substr(1)).join(' ');
  }
}
