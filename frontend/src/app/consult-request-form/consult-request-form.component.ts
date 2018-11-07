import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { IThrivForm } from '../shared/IThrivForm';
import { User } from '../user';

@Component({
  selector: 'app-consult-request-form',
  templateUrl: './consult-request-form.component.html',
  styleUrls: ['./consult-request-form.component.scss']
})
export class ConsultRequestFormComponent implements OnInit {
  user: User;
  errorMessage: string;
  errorMatcher = new ErrorMatcher();
  requestConsultForm: FormGroup = new FormGroup({});
  formStatus = 'form';
  fields = {
    request_category: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Pick the category that best represents your request:',
      type: 'select',
      selectOptions: [
        'Research Methods',
        'Informatics or Data Science',
        'Regulatory',
        'Finances or Funding',
        'Community or Collaboration',
        'Facilities or Services',
        'Research Administration',
        'Other',
      ]
    }),
    request_text: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Please describe the issue for which you are requesting a consult:',
      type: 'textarea',
      options: {
        status: ['words']
      }
    }),
  };
  iThrivForm = new IThrivForm(this.fields, this.requestConsultForm);

  constructor(private router: Router, private api: ResourceApiService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.iThrivForm.loadForm();
  }

  ngOnInit() {
    this.api.getSession().subscribe(user => {
      this.user = user;
    });
  }

  getFields() {
    return this.iThrivForm.getFields();
  }

  onSubmit() {
    this.iThrivForm.validate();
    if (!this.requestConsultForm.valid) { return; }
    this.formStatus = 'submitting';

    this.api.sendConsultRequestEmail(
      this.user,
      this.fields.request_category.formControl.value,
      this.fields.request_text.formControl.value
    ).subscribe(e => {
      this.formStatus = 'complete';
    }, error1 => {
      if (error1) {
        this.errorMessage = error1;
      }
      this.formStatus = 'form';
      this.changeDetectorRef.detectChanges();
    });
  }

  onCancel() {
    this.router.navigate(['']);
  }
}
