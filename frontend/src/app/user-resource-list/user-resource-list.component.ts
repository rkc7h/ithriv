import { Component, OnInit } from '@angular/core';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
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

  constructor(
    private api: ResourceApiService,
  ) {
      this.resources = [];
  }

  getUserResources() {
    this.api.getUserResources().subscribe(
      (resources) => {
        this.resources = resources
      }
    );
  }

  ngOnInit() {
      this.getUserResources();
      this.api.getSession().subscribe(user => {
        this.session = user;
      });
  }

}
