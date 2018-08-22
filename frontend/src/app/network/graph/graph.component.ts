import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ResourceApiService} from '../../shared/resource-api/resource-api.service';
import {Category} from '../../category';
import {hexColorToRGBA} from '../../shared/color';
import {selectTransition} from '../animations';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [selectTransition()]
})
export class GraphComponent {

  categories: Category[];
  category: Category;
  state = 'primary';
  relationship = 'root';

  layoutWidth = 982;
  layoutHeight = 982;
  navRadius = 40;
  parentTitleHeight = 30;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private api: ResourceApiService,
              private titleService: Title) {

    this.loadRootCategories();
  }

  loadRootCategories() {
    this.api.getCategories().subscribe(cats => {
      this.categories = cats;
      this.category = this.categories[0];
    });
  }

  viewBoxDimensions() {
    return `${-this.layoutWidth / 2} ${-this.layoutHeight / 2} ${this.layoutWidth} ${this.layoutHeight}`;
  }

  setState(s: string) {
    this.state = s;
  }

  setRelationship(r: string) {
    this.relationship = r;
  }

  setCategory(c: Category) {
    this.category = c;
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }
}
