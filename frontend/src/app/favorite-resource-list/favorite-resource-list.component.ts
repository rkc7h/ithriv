import { Component, OnInit } from '@angular/core';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-favorite-resource-list',
  templateUrl: './favorite-resource-list.component.html',
  styleUrls: ['./favorite-resource-list.component.scss']
})
export class FavoriteResourceListComponent implements OnInit {

  resources: Resource[];
  session: User;
  institution: Institution;

  constructor(
    private api: ResourceApiService,
  ) {
    this.resources = [];
  }

  getFavoriteResources() {
    this.api.getSession().subscribe(user => {
      if (user) {
        this.api.getUserFavorites().subscribe(
          (favorites) => {
            for (const f of favorites) {
              this.resources.push(f.resource);
            }
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
    this.getFavoriteResources();
    this.getInstitution();
  }
}
