import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { Icon } from '../icon';
import { ResourceApiService } from '../resource-api.service';

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
  icons: Icon[];

  constructor(
    private api: ResourceApiService
  ) {
    this.loadIcons();
  }

  ngOnInit() {
  }

  loadIcons() {
    this.api.getIcons().subscribe(icons => this.icons = icons);
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
