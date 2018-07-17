import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { Fieldset } from '../fieldset';
import { FormField } from '../form-field';
import { Resource } from '../resource';
import { ResourceCategory } from '../resource-category';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import { ValidateUrl } from '../shared/validators/url.validator';
import { getRandomString } from '../../../node_modules/@types/selenium-webdriver/safari';
import { FormSelectOption } from '../form-select-option';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss'],
  animations: [routerTransition()]
})
export class ResourceFormComponent implements OnInit {
  @HostBinding('@routerTransition')
  allCategories: Category[] = [];
  resourceCategories: ResourceCategory[] = [];
  createNew = false;
  error: string;
  errorMatcher = new ErrorMatcher();
  isDataLoaded = false;
  resource: Resource;
  resourceForm: FormGroup = new FormGroup({});
  showConfirmDelete = false;

  // Field groupings
  fieldsets: Fieldset[] = [];

  // Form Fields
  fields = {
    name: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 140,
      minLength: 1,
      placeholder: 'Name',
      type: 'text',
    }),
    description: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 2000,
      minLength: 20,
      placeholder: 'Description',
      type: 'textarea',
      options: {
        hideIcons: ['heading', 'image', 'side-by-side', 'fullscreen'],
        status: ['words'],
      }
    }),
    contact_notes: new FormField({
      formControl: new FormControl(),
      required: false,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Contact Details',
      type: 'text',
      fieldsetId: 'contact_info',
      fieldsetLabel: 'Contact:'
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
      maxLength: 100,
      minLength: 1,
      placeholder: 'Owner',
      type: 'text'
    }),
    cost: new FormField({
      formControl: new FormControl(),
      required: false,
      placeholder: 'Cost',
      type: 'select',
      selectOptions: [
        'N / A',
        'Variable',
        'Free Across iTHRIV',
        'Free to Home Institution',
        'Cost Recovery',
      ]
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
      placeholder: 'Select Institution',
      type: 'select',
      apiSource: 'getInstitutions'
    }),
    website: new FormField({
      formControl: new FormControl(),
      required: false,
      maxLength: 200,
      minLength: 7,
      placeholder: 'Website',
      type: 'url'
    }),
    categories: new FormField({
      formGroup: new FormGroup({}),
      required: true,
      placeholder: 'Select Categories',
      type: 'tree',
      apiSource: 'getCategories',
      multiSelect: true
    }),
    'availabilities.institution_id': new FormField({
      formControl: new FormControl(),
      required: false,
      placeholder: 'Select Institutions that may access this resource',
      type: 'select',
      multiSelect: true,
      apiSource: 'getInstitutions'
    }),
    approved: new FormField({
      formControl: new FormControl(),
      placeholder: 'This resource has been approved',
      type: 'toggle'
    }),
  };

  constructor(
    private api: ResourceApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loadData();
  }

  ngOnInit() {
  }

  loadData() {
    this.isDataLoaded = false;
    this.route.params.subscribe(params => {
      const resourceId = params['resource'];

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
        this.resource = { id: null, name: '', description: '' };
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

        if (fieldName === 'categories') {
          const selectedCatIds = this.resourceCategories.map(rc => rc.category.id);

          for (const cat of this.allCategories) {
            const checked = selectedCatIds.includes(cat.id);
            const control = new FormControl();
            control.setValue(checked);
            this.fields.categories.formGroup.addControl(cat.id.toString(), control);
          }

          this.fields.categories.formGroup.setValidators(validators);
          this.resourceForm.addControl(fieldName, this.fields.categories.formGroup);
          this.isDataLoaded = true;
        } else {
          field.formControl.setValidators(validators);

          if (fieldName === 'availabilities.institution_id') {
            const selectedInstitutions = this.resource.availabilities.filter(av => av.available);
            const selectedInstitutionIds = selectedInstitutions.map(i => i.institution_id);
            field.formControl.patchValue(selectedInstitutionIds);
          } else {
            field.formControl.patchValue(this.resource[fieldName]);
          }

          this.resourceForm.addControl(fieldName, field.formControl);
        }
      }
    }

    if (!this.createNew) {
      this.validate();
    }

    this.loadFieldsets();
  }

  getFields(): FormField[] {
    const fields = [];

    for (const fieldName in this.fields) {
      if (this.fields.hasOwnProperty(fieldName)) {
        fields.push(this.fields[fieldName]);
      }
    }

    return fields;
  }

  onSubmit($event) {
    $event.preventDefault();
    this.validate();

    if (this.resourceForm.valid) {
      this.isDataLoaded = false;

      for (const fieldName in this.fields) {
        if (this.resource.hasOwnProperty(fieldName) && this.fields.hasOwnProperty(fieldName)) {
          this.resource[fieldName] = this.fields[fieldName].formControl.value;
        }
      }

      if (this.createNew) {
        this.api.addResource(this.resource).subscribe(r => {
          this.resource = r;
          this.updateCategories();
          this.updateAvailabilities();
          // this.close();
          this.isDataLoaded = true;
        });
      } else {
        this.api.updateResource(this.resource).subscribe(r => {
          this.resource = r;
          this.updateCategories();
          this.updateAvailabilities();
          // this.close();
          this.isDataLoaded = true;
        });
      }
    } else {
      console.log('FORM NOT VALID');
    }
  }

  updateCategories() {
    const selectedCatIds = [];
    const controls = this.fields.categories.formGroup.controls;

    for (const key in controls) {
      if (controls.hasOwnProperty(key) && controls[key].value) {
        selectedCatIds.push(parseInt(key, 10));
      }
    }

    for (const cat of this.allCategories) {
      if (selectedCatIds.includes(cat.id)) {
        this.api.linkResourceAndCategory(this.resource, cat).subscribe();
      } else {
        this.resourceCategories.forEach(rc => {
          if (rc.category.id === cat.id) {
            this.api.unlinkResourceAndCategory(rc).subscribe();
          }
        });
      }
    }
  }

  updateAvailabilities() {
    const selectedInstitutionIds: number[] = this.fields['availabilities.institution_id'].formControl.value || [];

    // For each institution...
    this.api.getInstitutions().subscribe(institutions => {
      for (const institution of institutions) {
        if (selectedInstitutionIds.includes(institution.id)) {
          // ...link selected institutions with this resource
          this.api.linkResourceAndInstitutionAvailability(this.resource.id, institution.id).subscribe();
        } else {
          // ...unlink any deselected institutions
          this.resource.availabilities.forEach(av => {
            if (av.institution_id === institution.id) {
              this.api.unlinkResourceAndInstitutionAvailability(av).subscribe();
            }
          });
        }
      }
    });
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
}
