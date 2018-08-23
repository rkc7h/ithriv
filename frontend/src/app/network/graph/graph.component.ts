import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ResourceApiService} from '../../shared/resource-api/resource-api.service';
import {Category} from '../../category';
import {hexColorToRGBA} from '../../shared/color';
import {selectTransition} from '../animations';
import {NodeOptions} from '../../node-options';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [selectTransition()]
})
export class GraphComponent {

  topCategories: Category[];
  category: Category;
  selectedCategory: Category;
  relationship = 'root';
  flatCategories: Category[];

  layoutWidth = 982;
  layoutHeight = 982;
  baseRadius = 80;

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
      this.topCategories = cats;
      this.category = cats[0];
      this.selectedCategory = this.category;
      this.flatCategories = [];
      this.category.previousState = this.getState(this.category);
      this.flatten([this.category], this.flatCategories);
      console.log(`There are ${this.flatCategories.length} total categories`);
      for (const c of this.flatCategories) {
        c.previousState = this.getState(c);
      }
    });
  }

  // Recursive madness.
  flatten(input: Category[], output: Category[]) {
    for (const c of input) {
      output.push(c);
      if (c.children) {
        this.flatten(c.children, output);
      }
    }
  }

  viewBoxDimensions() {
    return `${-this.layoutWidth / 2} ${-this.layoutHeight / 2} ${this.layoutWidth} ${this.layoutHeight}`;
  }

  // Get x,y coordinates of a point at given angle on a circle of radius r,
  // provide them back as a translation directive.
  calcCoords(angle = 0, r = 0): NodeOptions {
    // Convert degrees to radians
    const theta = angle * Math.PI / 180;
    // x is adjacent, r is hypoteneuse
    const x = Math.cos(theta) * r;
    // y is opposite, r is hypoteneuse
    const y = Math.sin(theta) * r;
    return new NodeOptions({ x: x, y: y });
  }

  getPositionAsTransformation(nodeCount, nodeIndex, state) {
    let radius = 0;
    if (state === 'primary') {
      radius = this.baseRadius * 1.5 + this.baseRadius * 1.5;
    } else if (state === 'secondary') {
      radius = this.baseRadius * 1.5 + this.baseRadius * 1.5;
    } else if (state === 'tertiary') {
      radius = this.baseRadius + this.baseRadius * 0.35;
    } else if (state === 'n-ary') {
      radius = 0;
    }
    const angle = 360 / nodeCount * nodeIndex;
    const options = this.calcCoords(angle, radius);
    return `translate(${options.x},${options.y})`;
  }

  selectCategory(c: Category) {
    this.selectedCategory = c;
  }

  getState(node: Category) {
    if (!this.selectedCategory) {
      return 'secondary';
    }
    if (this.selectedCategory === node) {
      return 'primary';
    } else if (this.selectedCategory.parent && this.selectedCategory.parent.id === node.id) {
      return 'secondary';
    } else if (node.parent && this.selectedCategory.id === node.parent.id) {
      return 'secondary';
    } else if (node.parent && this.selectedCategory.parent &&
              this.selectedCategory.parent.id === node.parent.id) {
      return 'tertiary';
    } else {
      return 'n-ary';
    }
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
