import { Component, OnInit } from '@angular/core';
import { ResourceApiService } from "../shared/resource-api/resource-api.service";
import { Resource } from "../resource";
import { User } from "../user";
import {findReadVarNames} from "@angular/compiler/src/output/output_ast";

@Component({
  selector: 'app-favorite-resource-list',
  templateUrl: './favorite-resource-list.component.html',
  styleUrls: ['./favorite-resource-list.component.css']
})
export class FavoriteResourceListComponent implements OnInit {

  resources: Resource[];
  user: User;

  constructor(
    private api: ResourceApiService,
  ) {
      this.resources = [];
      this.loadUser();
  }

  loadUser() {
    this.api._getSession().subscribe(s => {
      this.user = s;
    });
  }

  getUserFavorites() {
    this.api.getUserFavorites(this.user).subscribe(favorites => {
      return favorites;
    });
  }

  getSession() {
    return this.api.session;
  }

  ngOnInit() {
  }

}
