import { Component, OnInit } from '@angular/core';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { User } from '../user';


@Component({
  selector: 'app-user-resource-list',
  templateUrl: './user-resource-list.component.html',
  styleUrls: ['./user-resource-list.component.scss']
})
export class UserResourceListComponent implements OnInit {
  resources: Resource[];
  session: User;
  institution: Institution;

  constructor(
    private api: ResourceApiService,
  ) {
    this.resources = [];
  }

  getUserResources() {
    this.api.getSession().subscribe(user => {
      if (user) {
        this.api.getUserResources().subscribe(
          (resources) => {
            this.resources = resources;
          }
        );
      }
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

  ngOnInit() {
    this.api.getSession().subscribe(user => {
      this.session = user;
    });
    this.getUserResources();
    this.getInstitution();
  }

}
