import { Component, OnInit, Input } from '@angular/core';
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
  @Input() user: User;
  institution: Institution;

  constructor(
    private api: ResourceApiService,
  ) {
    this.getUserResources();
    this.getInstitution();

  }

  getUserResources() {
    this.api.getUserResources().subscribe(resources => this.resources = resources);
  }

  getInstitution() {
    const instId = parseInt(sessionStorage.getItem('institution_id'), 10);
    if (isFinite(instId)) {
      this.api.getInstitution(instId).subscribe(inst => this.institution = inst);
    }
  }

  ngOnInit() {
  }

}
