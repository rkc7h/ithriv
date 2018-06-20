import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';

@Component({
  selector: 'app-category-tile',
  templateUrl: './category-tile.component.html',
  styleUrls: ['./category-tile.component.scss']
})
export class CategoryTileComponent implements OnInit {
  @Input() category: Category;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.router.navigate(['browse', category.id]);
  }

}
