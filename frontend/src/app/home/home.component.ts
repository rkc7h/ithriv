import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceQuery } from '../resource-query';
import { Filter, ResourceQuery } from '../resource-query';
import { fadeTransition } from '../shared/animations';

import { User } from '../user';

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
  resources: Resource;
  categories: Category[];
  user: User;

  constructor(
    private api: ResourceApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loadUser();
    this.categories = [];

    this.api.getCategories().subscribe(
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
    this.api.getSession().subscribe(s => {
      this.user = s;
    });
  }

  goSearch() {
    this.router.navigate(['search', this.searchBox.value]);
  }
}
