import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { FormField } from '../form-field';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit {
  @Input() field: FormField;
  @Input() errors: ValidationErrors;
  @Input() errorMatcher: ErrorStateMatcher;
  @Input() formGroup: FormGroup;
  options = [];
  dataLoaded = false;

  constructor(private api: ResourceApiService) {
  }

  ngOnInit() {
    this.loadOptions();
  }

  loadOptions() {
    if (this.field.type === 'select') {
      const source = this.field.apiSource;

      if (this.api[source] && (typeof this.api[source] === 'function')) {
        this.api[source]().subscribe(results => {
          this.options = results;
          this.dataLoaded = true;
        });
      }
    } else {
      this.dataLoaded = true;
    }
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
