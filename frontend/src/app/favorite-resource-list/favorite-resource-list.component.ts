import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-favorite-resource-list',
  templateUrl: './favorite-resource-list.component.html',
  styleUrls: ['./favorite-resource-list.component.scss']
})
export class FavoriteResourceListComponent implements OnInit {

  resources: Resource[];
  @Input() user: User;
  @Input() institution: Institution;

  constructor(
    private api: ResourceApiService,
  ) {
    this.resources = [];
    this.getFavoriteResources();
  }

  getFavoriteResources() {
    this.api.getUserFavorites().subscribe(favs => {
      this.resources = favs.map(f => f.resource);
    });
  }

  ngOnInit() {
  }
}
