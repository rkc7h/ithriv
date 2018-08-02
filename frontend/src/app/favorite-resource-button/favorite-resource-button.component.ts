import { Component, Input, OnInit } from '@angular/core';
import { Resource } from '../resource';
import { Favorite } from '../favorite';
import { ResourceApiService } from "../shared/resource-api/resource-api.service";
import {convertRuleOptions} from "tslint/lib/configuration";

@Component({
  selector: 'app-favorite-resource-button',
  templateUrl: './favorite-resource-button.component.html',
  styleUrls: ['./favorite-resource-button.component.css']
})
export class FavoriteResourceButtonComponent implements OnInit {
  @Input() resource: Resource;
  favorite: Favorite;

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
        return true
      }
    }
    return false
  }

  addFavorite() {
    this.api.addFavorite(this.api.session, this.resource).subscribe( f => {
      this.favorite = f;
      this.resource.favorites.push(this.favorite);
    });
  }

  deleteFavorite() {
    for (let f of this.resource.favorites) {
      if (f.user_id === this.api.session.id) {
        this.favorite = f
      }
    }
    this.api.deleteFavorite(this.favorite).subscribe( f => {
      const index = this.resource.favorites.indexOf(this.favorite, 0);
      if (index > -1) {
        this.resource.favorites.splice(index, 1);
      }
    });
  }
}
