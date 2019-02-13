import { Component, OnInit, Input } from '@angular/core';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Resource } from '../resource';
import { User } from '../user';
import { Institution } from '../institution';


@Component({
  selector: 'app-user-resource-list',
  templateUrl: './user-resource-list.component.html',
  styleUrls: ['./user-resource-list.component.scss']
})
export class UserResourceListComponent implements OnInit {
  resources: Resource[];
  @Input() user: User;
  @Input() institution: Institution;

  constructor(
    private api: ResourceApiService,
  ) {
    this.getUserResources();
  }

  getUserResources() {
    this.api.getUserResources().subscribe(resources => this.resources = resources);
  }

  ngOnInit() {
  }

}
