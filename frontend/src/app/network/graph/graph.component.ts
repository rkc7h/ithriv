import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ResourceApiService} from '../../shared/resource-api/resource-api.service';
import {Category} from '../../category';
import {hexColorToRGBA} from '../../shared/color';
import {childPositionTransition, grandchildPositionTransition, rootTransition} from '../animations';
import {NodeOptions} from '../../node-options';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [rootTransition(), childPositionTransition(), grandchildPositionTransition()]
})
export class GraphComponent {

  topCategories: Category[];
  category: Category;
  selectedCategory: Category;
  relationship = 'root';
  flatCategories: Category[];
  transitionState = 'moving';
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
      this.setIndexesAndBackReferences(this.category);
    });
  }

  // Recursive madness, beware.
  // This assures that a parent referers to the same exact object as
  // the element with children.
  setIndexesAndBackReferences(c: Category) {
      let index = 0;
      if (c.children) {
        for (const child of c.children) {
          child.index = index;
          child.parent = c;
          index++;
          this.setIndexesAndBackReferences(child);
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

  getCatPos(category, parent, index, scale= true) {
    const state = this.getState(category);
    let nodeCount = parent.children.length;
    let radius = 0;
    if (state === 'primary') {
      radius = this.baseRadius * 3;
      if (scale) { radius = radius * 1.5; }
    } else if (state === 'secondary') {
      radius = this.baseRadius * 3;
    } else if (state === 'tertiary') {
      radius = this.baseRadius * 1.5;
      if (scale) { radius += this.baseRadius * 4; }
    } else if (state === 'nary') {
      radius = 0;
    }

    let base_angle = 0;
    index = category.index;
    if (category.parent && category.level === 2) {
      // If there is a parent, then make room for a link back to the parent.
      base_angle = 360 / category.parent.parent.children.length * category.parent.index;
      base_angle = base_angle + 180;  // flip it to the other side,
      index = category.index + 1;
      nodeCount++;
    }

    const angle = base_angle + (360 / nodeCount * index);
    const options = this.calcCoords(angle, radius);
    return {x: options.x, y: options.y};
//    return `translate(${options.x},${options.y})`;
  }


  selectCategory(c: Category) {
    if (c === this.selectedCategory) return;
    this.selectedCategory = c;
    this.transitionState = 'moving';
  }

  transitionCallback() {
    this.transitionState = 'set';
  }

  /**
   * This node is the primary node, if it is the selected node.
   * It is secondary if it is a child or parent of the currently selected node.
   * otherwise it is teritary if it is the child or parent of a secondary node.
   * HOWEVER, mark tertiary as nary if we aren't viewing the primary node.
   * @param {Category} node
   * @returns {string}
   */
  getState(node: Category) {
    if (!this.selectedCategory) {
      this.selectedCategory = this.category;
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
    } else if (this.selectedCategory.id === node.parent.parent.id) {
      return 'tertiary';
    } else {
      return 'nary';
    }
  }

  getRootState() {
    if (this.selectedCategory) {
      if (this.selectedCategory.level === 0) {
        return 'root';
      } else {
        return 'child';
      }
    } else {
      return 'root';
    }
  }

  /**
   * Calculate the center of the currently selected node.
   */
  getRootShift() {
    if (this.selectedCategory === this.category) {
      return {x:0, y: 0};
    }
    const index = this.selectedCategory.index;
    const position = this.getCatPos(this.selectedCategory, this.category, index);
    position.x = -position.x;
    position.y = -position.y;
    return position;
  }

  setCategory(c: Category) {
    this.category = c;
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }
}
