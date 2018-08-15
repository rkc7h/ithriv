import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import { fadeTransition } from '../shared/animations';
import { hexColorToRGBA } from '../shared/color';

@Component({
  selector: 'app-category-tile',
  templateUrl: './category-tile.component.html',
  styleUrls: ['./category-tile.component.scss'],
  animations: [fadeTransition()],
})
export class CategoryTileComponent implements OnInit {
  @HostBinding('@fadeTransition')
  @Input() category: Category;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.router.navigate(['category', category.id, 'network']);
  }

  categoryImageURL() {
    const rootCat = this.category && (this.category.level === 0);
    if (rootCat) {
      return `url('/assets/browse/${this.category.image.replace('.png', '')}-tile.png')`;
    }
  }

  categoryColorLight() {
    return hexColorToRGBA(this.category.color, 0.1);
  }
}
