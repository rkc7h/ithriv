import { Component, HostBinding, OnInit, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Availability } from '../availability';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { Fieldset } from '../fieldset';
import { FormField } from '../form-field';
import { Resource } from '../resource';
import { ResourceCategory } from '../resource-category';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ValidateUrl } from '../shared/validators/url.validator';
import { FileAttachment } from '../file-attachment';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { User } from '../user';
import { IntervalService } from '../shared/interval/interval.service';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss'],
  animations: [fadeTransition()]
})
export class ResourceFormComponent implements OnInit {
  @HostBinding('@fadeTransition')
  allCategories: Category[] = [];
  resourceCategories: ResourceCategory[] = [];
  createNew = false;
  error: string;
  errorMatcher = new ErrorMatcher();
  isDataLoaded = false;
  resource: Resource;
  categoryId: string;
  resourceForm: FormGroup = new FormGroup({});
  showConfirmDelete = false;
  savesInAction = 0;
  files = {};
  progress: NgProgressComponent;
  progressMessage: '';
  user: User;
  timeLeftInSession: number;


  // Field groupings
  fieldsets: Fieldset[] = [];

  // Form Fields
  fields: any = {};

  constructor(
    private api: ResourceApiService,
    private route: ActivatedRoute,
    private router: Router,
    public snackBar: MatSnackBar,
    private intervalService: IntervalService
  ) {

    this.api.getSession().subscribe(user => {
      this.user = user;
      this.loadFields();
      this.loadData();
    });

    const numMinutes = 1;
    this.intervalService.setInterval(() => {
      // Update seconds
      this.timeLeftInSession -= 1000;

      // Check status every numMinutes
      if ((this.timeLeftInSession % (numMinutes * 60 * 1000)) < 1000) {
        this.checkStatus();
      }
    }, 1000);
  }

  ngOnInit() {
    // this.api.getSession().subscribe(user => this.user = user);
    this.checkStatus();
  }

  // Warn the user if there session has less than 5 minutes remaining.
  toolBarWarningClass() {
    if (this.user && this.timeLeftInSession < 300000) {
      return 'warning';
    } else {
      return '';
    }
  }

  checkStatus() {
    const token = localStorage.getItem('token');

    if (token) {
      this.api.getSessionStatus().subscribe((timestamp: number) => {
        const now = new Date();
        const exp = new Date(timestamp * 1000);
        const msLeft: number = exp.getTime() - now.getTime();
        const loggedOut = (timestamp <= 0) || (msLeft <= 0);
        this.timeLeftInSession = msLeft;

        if (loggedOut) {
          this.api.closeSession().subscribe((_: any) => {
            this.intervalService.clearInterval();
            this.user = null;
            this.router.navigate(['timedout']);
          });
        } else {
          this.api.getSession().subscribe(user => {
            this.user = user;
          });
        }
      });
    }
  }

  loadData() {
    this.isDataLoaded = false;
    this.route.params.subscribe(params => {
      const resourceId = params['resource'];
      this.categoryId = params['category'];

      if (resourceId) {
        this.createNew = false;
        this.loadAllCategories(() => {
          this.api
            .getResource(resourceId)
            .subscribe(resource => {
              this.resource = resource;
              this.loadResourceCategories(resource, () => this.loadForm());
            });
        });
      } else {
        this.createNew = true;
        this.resource = { id: null, name: '', description: '', availabilities: [] };
        this.loadAllCategories(() => this.loadForm());
      }
    });
  }

  loadAllCategories(callback: Function) {
    const leafCats = function (cats, result = []) {
      for (const c of cats) {
        if (Array.isArray(c.children) && (c.children.length > 0)) {
          result = leafCats(c.children, result);
        } else {
          result.push(c);
        }
      }
      return result;
    };

    this.api.getCategories().subscribe(categories => {
      this.allCategories = leafCats(categories);
      callback();
    });
  }

  loadResourceCategories(resource: Resource, callback: Function) {
    this.api
      .getResourceCategories(resource)
      .subscribe(rcs => {
        this.resourceCategories = rcs;
        callback();
      });
  }

  loadResourceFiles() {
    if (this.resource.files && (this.resource.files.length > 0)) {
      this.resource.files.forEach(fa => {
        if (fa.id) {
          this.fields.attachments.attachments.set(fa.md5, fa);
          this.fields.attachments.formControl.updateValueAndValidity({ emitEvent: true });
        }
      });
    }
  }

  loadFieldsets() {
    this.fieldsets = [];

    // Loop through each form field
    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        const field = this.fields[fieldName];

        // If fieldset id is different from current, create new fieldset
        if (
          (this.fieldsets.length === 0) ||
          (this.fieldsets[this.fieldsets.length - 1].id !== field.fieldsetId)
        ) {
          this.fieldsets.push(new Fieldset({
            id: field.fieldsetId || Math.random().toString(),
            label: field.fieldsetLabel || null,
            fields: []
          }));
        }

        // Add the field to the fieldset
        this.fieldsets[this.fieldsets.length - 1].fields.push(field);
      }
    }
  }

  loadFields() {
    this.fields = {
      name: new FormField({
        formControl: new FormControl(),
        required: true,
        maxLength: 140,
        minLength: 1,
        placeholder: 'Resource Name',
        type: 'text',
        helpText: `
        You must be one of the persons responsible for a research resource to add it.
        After saving your resource page, a system administrator must review and approve
        it before it will be live in the system.
      `
      }),
      description: new FormField({
        formControl: new FormControl(),
        required: false,
        placeholder: 'Description',
        type: 'richtexteditor',
        options: {
          status: ['words'],
        },
        helpText: `
        Describe your resource or service and when a researcher or community member
        should access it.  You may use the hyperlink feature here to link to multiple
        external websites or other related portal pages, but you should use the WEBSITE
        field below for the main associated webpage.
      `
      }),
      contact_notes: new FormField({
        formControl: new FormControl(),
        required: false,
        maxLength: 100,
        minLength: 1,
        placeholder: 'Contact Details',
        type: 'text',
        fieldsetId: 'contact_info',
        fieldsetLabel: 'Contact:',
        helpText: `Contact information is optional, but will be displayed to the users.`
      }),
      contact_email: new FormField({
        formControl: new FormControl(),
        required: false,
        maxLength: 100,
        minLength: 1,
        placeholder: 'Contact Email',
        type: 'email',
        fieldsetId: 'contact_info'
      }),
      contact_phone: new FormField({
        formControl: new FormControl(),
        required: false,
        maxLength: 100,
        minLength: 1,
        placeholder: 'Contact Phone',
        type: 'text',
        fieldsetId: 'contact_info'
      }),
      owner: new FormField({
        formControl: new FormControl(),
        required: true,
        maxLength: 1000,
        minLength: 1,
        placeholder: 'Owners',
        type: 'text',
        helpText: `
          Enter the **email addresses** of the people who are responsible for this
          resource page and should be able to edit in the future.  The email must be
          in one of the following formats: xxx@virginia.edu, xxx@vt.edu,
          xxx@carilionclinic.org, xxx@inova.org.
        `,
        defaultValue: this.user.email.toLowerCase()
      }),
      cost: new FormField({
        formControl: new FormControl(),
        required: false,
        placeholder: 'Cost Type',
        type: 'select',
        selectOptions: [
          'N / A',
          'Variable',
          'Free Across iTHRIV',
          'Free to Home Institution',
          'Cost Recovery',
        ],
        helpText: `
        This is an optional field and can be used to generally indicate if there are
        charges associated with use of this resource.
      `
      }),
      type_id: new FormField({
        formControl: new FormControl(),
        required: true,
        placeholder: 'Select Type',
        type: 'select',
        apiSource: 'getTypes'
      }),
      institution_id: new FormField({
        formControl: new FormControl(),
        required: true,
        placeholder: 'Home Institution',
        type: 'select',
        apiSource: 'getInstitutions',
        fieldsetId: 'institution_prefs',
        fieldsetLabel: 'Institutions'
      }),
      private: new FormField({
        formControl: new FormControl(),
        required: false,
        placeholder: 'Only visible to Home Institution',
        type: 'checkbox',
        fieldsetId: 'institution_prefs',
        helpText: `If this box is checked, this resource will only be visible to the Home Institution selected above.`
      }),
      'availabilities.institution_id': new FormField({
        formControl: new FormControl(),
        required: true,
        placeholder: 'Which institutions can use this resource?',
        type: 'select',
        multiSelect: true,
        apiSource: 'getAvailabilityInstitutions',
        fieldsetId: 'institution_prefs',
        helpText: `
        Select the audiences or user groups that have access to this resource or
        service. These user groups will see this in their "resources you have access
        to" category tabs. User groups not selected here will only see this resource
        page when they select the "view all in category" tab.
      `
      }),
      website: new FormField({
        formControl: new FormControl(),
        required: false,
        maxLength: 200,
        minLength: 7,
        placeholder: 'Website',
        type: 'url',
        helpText: `
        Provide the primary URL associated with this resource. This is an optional
        field.
      `
      }),
      categories: new FormField({
        formGroup: new FormGroup({}),
        required: true,
        placeholder: 'Select Categories',
        type: 'tree',
        apiSource: 'getCategories',
        multiSelect: true
      }),
      attachments: new FormField({
        formControl: new FormControl(),
        attachments: new Map<number | string, FileAttachment>(),
        required: false,
        placeholder: 'Attachments',
        type: 'files'
      }),
    };
  }

  loadForm() {
    this.isDataLoaded = false;

    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        const field = this.fields[fieldName];
        const validators = [];

        if (field.required) {
          validators.push(Validators.required);
        }

        if (field.minLength) {
          validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength) {
          validators.push(Validators.maxLength(field.maxLength));
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        if (field.type === 'url') {
          validators.push(ValidateUrl);
        }

        if (fieldName === 'attachments') {
          this.loadResourceFiles();
        }

        if (fieldName === 'categories') {
          const selectedCatIds = this.resourceCategories.map(rc => rc.category.id);

          if (this.categoryId) {
            selectedCatIds.push(parseInt(this.categoryId, 10));
          }

          for (const cat of this.allCategories) {
            const checked = (
              selectedCatIds &&
              (selectedCatIds.length > 0) &&
              selectedCatIds.includes(cat.id)
            );
            const control = new FormControl();
            control.setValue(checked);
            this.fields.categories.formGroup.addControl(cat.id.toString(), control);
          }

          this.fields.categories.formGroup.setValidators(validators);
          this.resourceForm.addControl(fieldName, this.fields.categories.formGroup);
          this.isDataLoaded = true;
        } else {
          if (field.formControl) {
            field.formControl.setValidators(validators);

            if (fieldName === 'owner' && !this.resource[fieldName]) {
              field.formControl.patchValue(this.user.email.toLowerCase());
            } else if (fieldName === 'availabilities.institution_id') {
              const selectedInstitutions = this.resource.availabilities.filter(av => av.available);
              const selectedInstitutionIds = selectedInstitutions.map(i => i.institution_id);
              field.formControl.patchValue(selectedInstitutionIds);
            } else if (!this.resource[fieldName] && field.defaultValue) {
              field.formControl.patchValue(field.defaultValue);
            } else if (this.resource[fieldName]) {
              field.formControl.patchValue(this.resource[fieldName]);
            }

            this.resourceForm.addControl(fieldName, field.formControl);
          }
        }
      }
    }

    if (!this.createNew) {
      this.validate();
    }

    this.loadFieldsets();
  }

  onSubmit($event, submitForApproval = false) {
    $event.preventDefault();
    this.validate();

    if (this.resourceForm.valid) {
      this.isDataLoaded = false;
      const fieldNames = Object.keys(this.fields);

      for (const fieldName of fieldNames) {
        if (this.fields[fieldName].formControl) {

          // If the resource is being added, check that
          // the user's email address is in the owner field
          if (this.createNew && (fieldName === 'owner')) {
            const email = this.user.email.toLowerCase();
            const oldOwner = this.fields[fieldName].formControl.value.toLowerCase();

            if (oldOwner.includes(email)) {
              this.resource.owner = oldOwner;
            } else {
              this.resource.owner = `${email}, ${oldOwner}`;
            }
          } else {
            this.resource[fieldName] = this.fields[fieldName].formControl.value;
          }
        }
      }

      if (!this.resource.approved) {
        this.resource.approved = submitForApproval ? 'Requested' : 'Unapproved';
      } else if (submitForApproval && (this.resource.approved === 'Unapproved')) {
        this.resource.approved = 'Requested';
      }

      const fnName = this.createNew ? 'addResource' : 'updateResource';

      if (this.hasAttachments()) {
        const numAttachments = this.fields.attachments.attachments.size;
        let numDone = 0;

        this.api[fnName](this.resource)
          .pipe(
            map(r => this.resource = r),
            switchMap(() => this.updateCategories()),
            switchMap(() => this.updateAvailabilities()),
            switchMap(() => this.updateAttachments()),
            map(ras => {
              ras.subscribe(resourceAttachment => {
                numDone++;

                if (numDone === numAttachments) {
                  if (submitForApproval) {
                    this.api
                      .sendApprovalRequestEmail(this.user, this.resource)
                      .subscribe(result => this.isDataLoaded = true);
                  } else {
                    this.close();
                  }
                }
              });
            })
          ).subscribe(result => console.log('result', result));
      } else {
        this.api[fnName](this.resource)
          .pipe(
            map(r => this.resource = r),
            switchMap(() => this.updateCategories()),
            switchMap(() => this.updateAvailabilities()),
          )
          .subscribe(
            result => console.log('result', result),
            error => console.error(error),
            () => {
              if (submitForApproval) {
                this.api
                  .sendApprovalRequestEmail(this.user, this.resource)
                  .subscribe(result => this.isDataLoaded = true);
              } else {
                this.close();
              }
            }
          );
      }
    } else {
      const messages: string[] = [];
      const controls = this.resourceForm.controls;
      for (const fieldName in controls) {
        if (controls.hasOwnProperty(fieldName)) {
          const errors = controls[fieldName].errors;
          const label = this.fields[fieldName].placeholder;

          for (const errorName in errors) {
            if (errors.hasOwnProperty(errorName)) {
              switch (errorName) {
                case 'email':
                  messages.push(`${label} is not a valid email address.`);
                  break;
                case 'maxlength':
                  messages.push(`${label} is not long enough.`);
                  break;
                case 'minlength':
                  messages.push(`${label} is too short.`);
                  break;
                case 'required':
                  messages.push(`${label} is empty.`);
                  break;
                case 'url':
                  messages.push(`${label} is not a valid URL.`);
                  break;
                default:
                  messages.push(`${label} has an error.`);
                  break;
              }
            }
          }
        }
      }

      const action = '';
      const message = `Please double-check the following fields: ${messages.join(' ')}`;
      this.snackBar.open(message, action, {
        duration: 2000, panelClass: 'snackbar-warning'
      });
    }
  }

  updateCategories() {
    const selectedCategories = [];
    const controls = this.fields.categories.formGroup.controls;

    for (const key in controls) {
      if (controls.hasOwnProperty(key) && controls[key].value) {
        selectedCategories.push({ resource_id: this.resource.id, category_id: parseInt(key, 10) });
      }
    }
    return this.api.updateResourceCategories(this.resource, selectedCategories);
  }

  updateAvailabilities() {
    const availabilities: Availability[] = [];
    for (const value of this.fields['availabilities.institution_id'].formControl.value || []) {
      availabilities.push({ resource_id: this.resource.id, institution_id: value, available: true });
    }
    return this.api.updateResourceAvailability(this.resource, availabilities);
  }

  updateAttachments() {
    if (this.hasAttachments()) {
      const attachments: FileAttachment[] = [];
      this.fields.attachments.attachments.forEach(a => {
        if (this.resource) {
          a.resource_id = this.resource.id;
        }
        attachments.push(a);
      });

      return attachments.map(a => this.api.updateFileAttachment(a));
    }
  }

  uploadFileAttachment(attachment: FileAttachment) {
    const file: File = this.files[attachment.name];
    return this.api.addFileAttachmentBlob(attachment.id, file, this.progress);
  }

  onCancel() {
    this.close();
  }

  validate() {
    for (const key in this.resourceForm.controls) {
      if (this.resourceForm.controls.hasOwnProperty(key)) {
        const control = this.resourceForm.controls[key];
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }

  showDelete() {
    this.showConfirmDelete = true;
  }

  onDelete() {
    this.api.deleteResource(this.resource).subscribe(r => {
      this.close();
    },
      error => this.error = error
    );
  }

  // Go to resource screen
  close() {
    if (this.resource && this.resource.id) {
      this.router.navigate(['resource', this.resource.id]);
    } else {
      this.route.params.subscribe(params => {
        const resourceId = params['resource'];
        const categoryId = params['category'];

        if (resourceId) {
          this.router.navigate(['resource', resourceId]);
        } else if (categoryId) {
          this.router.navigate(['category', categoryId]);
        }
      });
    }
  }

  getFieldErrors(field: FormField) {
    if (field.formControl) {
      return field.formControl.errors;
    } else if (field.formGroup) {
      return field.formGroup.errors;
    }
  }

  hasAttachments() {
    return (
      this.fields.attachments &&
      this.fields.attachments.attachments &&
      (this.fields.attachments.attachments.size > 0)
    );
  }

  userIsOwner() {
    if (
      this.user &&
      this.user.email &&
      this.resource &&
      this.resource.owners &&
      (this.resource.owners.length > 0)
    ) {
      for (const owner of this.resource.owners) {
        if (owner.toLowerCase() === this.user.email.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }
}
