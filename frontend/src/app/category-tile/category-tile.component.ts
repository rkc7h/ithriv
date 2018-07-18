import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-category-tile',
  templateUrl: './category-tile.component.html',
  styleUrls: ['./category-tile.component.scss'],
  animations: [routerTransition()],
})
export class CategoryTileComponent implements OnInit {
  @HostBinding('@routerTransition')
  @Input() category: Category;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.router.navigate(['browse', category.id]);
  }

}
