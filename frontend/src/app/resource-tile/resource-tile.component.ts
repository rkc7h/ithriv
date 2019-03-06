import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceType } from '../resourceType';
import { User } from '../user';

@Component({
  selector: 'app-resource-tile',
  templateUrl: './resource-tile.component.html',
  styleUrls: ['./resource-tile.component.scss']
})
export class ResourceTileComponent implements OnInit {
  @Input() resource: Resource;
  @Input() user: User;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  resourceRoute(resource: Resource) {
    return (['/resource', resource.id]);
  }

  institutionRoute(institution: Institution) {
    return (`/search/filter?Institution=${institution.name}`);
  }

  typeRoute(type: ResourceType) {
    return (`/search/filter?Type=${type.name}`);
  }

  typeIconId(resource: Resource) {
    return resource && resource.type && resource.type.icon && resource.type.icon.id;
  }

  truncateWords(str: string, numWords: number) {
    if (str) {
      const maxChars = 36 * 3;
      const allWords = str.split(' ');
      const someWords = allWords.slice(0, numWords);
      if (allWords.length > someWords.length) {
        const someStr = someWords.join(' ');

        if (someStr.length + 3 > maxChars) {
          return this.truncateWords(someStr, numWords - 1);
        } else {
          return someStr + '...';
        }
      }
    }
    return str;
  }
}

