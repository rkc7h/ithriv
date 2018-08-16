import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Resource } from '../resource';
import { Institution } from '../institution';

@Component({
  selector: 'app-resource-tile',
  templateUrl: './resource-tile.component.html',
  styleUrls: ['./resource-tile.component.scss']
})
export class ResourceTileComponent implements OnInit {
  @Input() resource: Resource;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goResource($event, resource: Resource) {
    $event.preventDefault();
    this.router.navigate(['resource', resource.id]);
  }

  categoryColor(resource: Resource): string {
    console.log('resource', resource);

    if (resource && resource.resource_categories) {
      const numCategories = resource.resource_categories.length;

      if (numCategories > 0) {
        const percent = 100 / numCategories;
        const colors = resource.resource_categories.map((rc, i) => {
          return `
          ${rc.category.color} ${i * percent}%,
          ${rc.category.color} ${(i + 1) * percent}%
        `;
        });

        return `linear-gradient(to right,${colors.join(',')})`;
      }
    }

    return 'linear-gradient(to right, #999 0%, #999 100%)';
  }

  truncateWords(str: string, numWords: number) {
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
    } else {
      return str;
    }
  }
}

