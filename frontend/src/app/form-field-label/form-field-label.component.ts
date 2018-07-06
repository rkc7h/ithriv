import { Component, OnInit, Input } from '@angular/core';
import { FormField } from '../form-field';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-label',
  templateUrl: './form-field-label.component.html',
  styleUrls: ['./form-field-label.component.scss']
})
export class FormFieldLabelComponent implements OnInit {
  @Input() field: FormField;
  @Input() valid: boolean;

  constructor() { }

  ngOnInit() {
    if (this.field.type === 'textarea') {
      this.field.formControl.statusChanges.subscribe(v => console.log('v:', v));
    }
  }
}

