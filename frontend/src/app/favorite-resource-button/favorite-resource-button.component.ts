import { Component, Input, OnInit } from '@angular/core';
import { Resource } from '../resource';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";

@Component({
  selector: 'app-favorite-resource-button',
  templateUrl: './favorite-resource-button.component.html',
  styleUrls: ['./favorite-resource-button.component.css']
})
export class FavoriteResourceButtonComponent implements OnInit {
  @Input() resource: Resource;

  constructor(
    private api: ResourceApiService
  ) {}

  ngOnInit() {
  }

  getSession() {
    return this.api.session;
  }

  userFavorite() {
    for (let f of this.resource.favorites) {
      if (f.user_id === this.api.session.id) {
        this.resource.user_favorite = true
      }
    }
    return this.resource.user_favorite
  }

}
