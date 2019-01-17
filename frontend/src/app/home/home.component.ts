import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceQuery } from '../resource-query';
import { fadeTransition } from '../shared/animations';

import { User } from '../user';
import { Institution } from '../institution';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeTransition()],
})
export class HomeComponent implements OnInit {
  @HostBinding('@fadeTransition')
  @Input() resourceQuery: ResourceQuery;

  searchForm: FormGroup;
  searchBox: FormControl;
  loading = false;
  resources: Resource[];
  categories: Category[];
  user: User;
  institution: Institution;

  constructor(
    private api: ResourceApiService,
    private router: Router
  ) {
    this.loadUser();
    this.categories = [];

    this.api.getRootCategories().subscribe(
      (categories) => {
        this.categories = categories;
      }
    );

    this.api.getResources().subscribe(
      (resources) => {
        this.resources = resources;
      }
    );
  }


  ngOnInit() {
    this.searchBox = new FormControl();
    this.searchForm = new FormGroup({
      searchBox: this.searchBox
    });
  }

  loadUser() {
    this.api.getSession().subscribe(user => {
      this.user = user;
      this.getInstitution();
    });
  }

  getInstitution() {
    if (sessionStorage.getItem('institution_id')) {
      this.api.getInstitution(parseInt(sessionStorage.getItem('institution_id'), 10)).subscribe(
        (inst) => {
          this.institution = inst;
        }
      );
    }
  }

  goSearch() {
    this.router.navigate(['search', this.searchBox.value]);
  }

  goCategory(category: Category) {
    const viewPrefs = this.api.getViewPreferences();
    const isNetworkView = viewPrefs && viewPrefs.hasOwnProperty('isNetworkView') ? viewPrefs.isNetworkView : true;
    const catId = category.id.toString();

    if (isNetworkView) {
      this.router.navigate(['network', catId]);
    } else {
      this.router.navigate(['browse', catId]);
    }
  }
}
