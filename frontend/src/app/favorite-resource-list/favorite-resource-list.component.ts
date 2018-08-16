import { Component, OnInit } from '@angular/core';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Resource } from '../resource';
import {User} from '../user';

@Component({
  selector: 'app-favorite-resource-list',
  templateUrl: './favorite-resource-list.component.html',
  styleUrls: ['./favorite-resource-list.component.css']
})
export class FavoriteResourceListComponent implements OnInit {

  resources: Resource[];
  session: User;

  constructor(
    private api: ResourceApiService,
  ) {
      this.resources = [];
  }

  getFavoriteResources() {
    this.api.getUserFavorites().subscribe(
      (favorites) => {
        for (const f of favorites) {
          this.resources.push(f.resource);
        }
      }
    );
  }

  ngOnInit() {
      this.getFavoriteResources();
      this.api.getSession().subscribe(user => {
        this.session = user;
      });
  }

}
