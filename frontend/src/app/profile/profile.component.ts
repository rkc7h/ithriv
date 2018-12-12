import { Component, OnInit, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorMatcher } from '../error-matcher';
import { FormField } from '../form-field';
import { User } from '../user';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { IThrivForm } from '../shared/IThrivForm';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  errorEmitter = new EventEmitter<string>();
  submitEmitter = new EventEmitter<boolean>();
  errorMatcher = new ErrorMatcher();
  profileForm: FormGroup = new FormGroup({});
  createNew = true;  // If false, we are editing an existing user;
  user: User;
  errorMessage = '';
  fields = {
    display_name: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Display Name',
      type: 'text',
    }),
    email: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Email',
      type: 'email',
    }),
    institution_id: new FormField({
      formControl: new FormControl(),
      required: false,
      placeholder: 'Home Institution',
      type: 'select',
      apiSource: 'getInstitutions',
      fieldsetId: 'institution_prefs',
      fieldsetLabel: 'Institutions'
    }),
    role: new FormField({
      formControl: new FormControl(),
      required: true,
      placeholder: 'Role',
      type: 'select',
      selectOptions: ['User', 'Admin'],
      fieldsetId: 'role',
      fieldsetLabel: 'Role'
    }),
  };
  iThrivForm = new IThrivForm(this.fields, this.profileForm);

  constructor(
    private api: ResourceApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.iThrivForm.loadForm();

    this.user = {
      id: null, display_name: this.fields.display_name.formControl.value,
      email: this.fields.email.formControl.value, institution_id: this.fields.institution_id.formControl.value, role: 'User'
    };
    this.iThrivForm.setObjectToEdit(this.user);

    this.route.params.subscribe(params => {
      if ('id' in params) {
        api.getUser(params['id']).subscribe(user => {
          this.user = user;
          this.createNew = false;
          this.iThrivForm.setObjectToEdit(this.user);
        });
      }
    });
  }

  ngOnInit() {
  }

  getFields() {
    return this.iThrivForm.getFields();
  }

  onSubmit() {
    this.iThrivForm.validate();
    if (!this.profileForm.valid) { return; }
    this.iThrivForm.updateObject(this.user);
    this.submitEmitter.emit(true);
    if (this.createNew) {
      this.api.addUser(this.user).subscribe(user => {
        this.router.navigate(['admin/users']);
        this.submitEmitter.emit(false);
      }, error1 => {
        if (error1) {
          this.errorEmitter.emit(error1);
        } else {
          this.errorEmitter.emit('An unexpected error occurred.  Please contact support.');
        }
        this.submitEmitter.emit(false);
      });
    } else {
      this.user.institution_id = this.user.institution_id || null;
      this.api.updateUser(this.user).subscribe(user => {
        this.router.navigate(['admin/users']);
        this.submitEmitter.emit(false);
      }, error1 => {
        if (error1) {
          this.errorEmitter.emit(error1);
        } else {
          this.errorEmitter.emit('An unexpected error occurred.  Please contact support.');
        }
        this.submitEmitter.emit(false);
      });
    }
  }

  onCancel() {
    this.router.navigate(['admin/users']);
  }
}
