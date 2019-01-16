import { Component, Input, OnInit } from '@angular/core';
import { Favorite } from '../favorite';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-favorite-resource-button',
  templateUrl: './favorite-resource-button.component.html',
  styleUrls: ['./favorite-resource-button.component.scss']
})
export class FavoriteResourceButtonComponent implements OnInit {
  @Input() resource: Resource;
  favorite: Favorite;
  @Input() user: User;

  constructor(
    private api: ResourceApiService
  ) { }

  ngOnInit() {
  }

  userFavorite() {
    for (const f of this.resource.favorites) {
      if (f.user_id === this.user.id) {
        return true;
      }
    }
    return false;
  }

  addFavorite() {
    this.api.addFavorite(this.user, this.resource).subscribe(f => {
      this.favorite = f;
      this.resource.favorites.push(this.favorite);
    });
  }

  deleteFavorite() {
    for (const f of this.resource.favorites) {
      if (f.user_id === this.user.id) {
        this.favorite = f;
      }
    }
    this.api.deleteFavorite(this.favorite).subscribe(f => {
      const index = this.resource.favorites.indexOf(this.favorite, 0);
      if (index > -1) {
        this.resource.favorites.splice(index, 1);
      }
    });
  }

  handleClick($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.userFavorite()) {
      this.deleteFavorite();
    } else {
      this.addFavorite();
    }
  }

  instructions(): string {
    if (this.userFavorite()) {
      return 'Delete Resource from Favorites';
    } else {
      return 'Add Resource to Favorites';
    }
  }
}
