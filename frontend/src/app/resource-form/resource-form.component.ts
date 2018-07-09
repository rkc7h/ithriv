import { Component, OnInit, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ValidateUrl } from '../shared/validators/url.validator';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-resource-form',
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss'],
  animations: [routerTransition]
})
export class ResourceFormComponent implements OnInit {
  @HostBinding('@routerTransition')
  category: Category;
  createNew = false;
  error: string;
  errorMatcher = new ErrorMatcher();
  isDataLoaded = false;
  resource: Resource;
  resourceForm: FormGroup;
  showConfirmDelete = false;

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
    owner: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 1,
      placeholder: 'Owner',
      type: 'text'
    }),
    institution: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Select Institution',
      type: 'select',
      apiSource: 'getInstitutions'
    }),
    website: new FormField({
      formControl: new FormControl(),
      required: true,
      maxLength: 100,
      minLength: 7,
      placeholder: 'Website',
      type: 'url'
    }),
    categories: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Select Categories',
      type: 'tree',
      apiSource: 'getCategories',
      multiSelect: true
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
    this.route.params.subscribe(params => {
      const resourceId = params['resource'];

      if (resourceId) {
        this.createNew = false;
        this.api
          .getResource(resourceId)
          .subscribe((r) => {
            this.resource = r;
            this.isDataLoaded = true;
            this.loadForm();
          });
      } else {
        this.createNew = true;
        this.resource = { id: null, name: '', description: '' };
        const categoryId = params['category'];

        if (categoryId) {
          this.api
            .getCategory(categoryId)
            .subscribe((c) => {
              this.category = c;
              this.isDataLoaded = true;
              this.loadForm();
              this.isDataLoaded = true;
            });
        }
      }
    });
  }

  loadForm() {
    const formGroup = {};
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

        field.formControl.patchValue(this.resource[fieldName]);
        // this[fieldName].valueChanges.subscribe(t => this.resource[fieldName] = t);
        field.formControl.setValidators(validators);
        formGroup[fieldName] = field.formControl;
      }
    }

    this.resourceForm = new FormGroup(formGroup);
    this.isDataLoaded = true;

    if (!this.createNew) {
      this.validate();
    }
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

  onSubmit() {
    this.validate();

    if (this.resourceForm.valid) {
      this.isDataLoaded = false;

      for (const fieldName in this.fields) {
        if (this.fields.hasOwnProperty(fieldName)) {
          this.resource[fieldName] = this.fields[fieldName].formControl.value;
        }
      }

      if (this.createNew) {
        this.api.addResource(this.resource).subscribe(r => {
          this.resource = r;
          if (this.category) {
            this.api.linkResourceAndCategory(this.resource, this.category).subscribe();
          }

          this.close();
        });
      } else {
        this.api.updateResource(this.resource).subscribe(r => {
          this.resource = r;
          this.close();
        });
      }
    }
  }

  onCancel() {
    this.close();
  }

  validate() {
    for (const key in this.resourceForm.controls) {
      if (this.resourceForm.controls.hasOwnProperty(key)) {
        const control = this.resourceForm.controls[key];
        control.markAsTouched();
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

  close() {
    console.log('this.resource.id:', this.resource && this.resource.id);

    // Go to resource screen
    if (this.resource && this.resource.id) {
      this.router.navigate(['resource', this.resource.id]);
    } else if (this.category && this.category.id) {
      this.router.navigate(['category', this.category.id]);
    }
  }
}
