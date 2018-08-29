import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ResourceApiService} from '../../shared/resource-api/resource-api.service';
import {Category} from '../../category';
import {hexColorToRGBA} from '../../shared/color';
import {childPositionTransition, grandchildPositionTransition, menuTransition, rootTransition} from '../animations';
import {NodeOptions} from '../../node-options';
import {Location} from '@angular/common';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [menuTransition(), rootTransition(), childPositionTransition(), grandchildPositionTransition()]
})
export class GraphComponent {

  topCategories: Category[];
  category: Category;
  selectedCategory: Category;
  transitionState = 'moving';
  layoutWidth = 982;
  layoutHeight = 982;
  baseRadius = 80;

  navRadius = 40;
  parentTitleHeight = 30;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private api: ResourceApiService,
              private location: Location,
              private titleService: Title) {

    this.route.params.subscribe(params => {
      if (params && params.hasOwnProperty('category')) {
        console.log("Laoding Category #" + params['category']);
        this.loadRootCategories(Number(params['category']));
      } else {
        this.loadRootCategories();
      }
    });
  }

  setInitialCategory(c: Category) {
    switch (c.level) {
      case 0:
        this.category = c;
        this.selectedCategory = c;
        break;
      case 1:
        this.category = c.parent;
        this.selectedCategory = c;
        break;
      case 2:
        this.category = c.parent.parent;
        this.selectedCategory = c.parent;
        break;
    }
  }

  loadRootCategories(category_id = -1) {
    this.api.getCategories().subscribe(cats => {
      this.topCategories = cats;
      let index = 0;
      for (const c of this.topCategories) {
        c.index = index;
        index++;
        this.setIndexesAndBackReferences(c, category_id);
        if (!this.category) {
          this.setCategory(this.topCategories[0]);
        }
      }
    });
  }

  // Recursive madness, beware.
  // This assures that a parent referers to the same exact object as
  // the element with children.
  setIndexesAndBackReferences(c: Category, category_id: Number) {
      let index = 0;
      // Set the selected category
      if (c.id === category_id) {
        this.setInitialCategory(c);
      }
      if (c.children) {
        for (const child of c.children) {
          child.index = index;
          child.parent = c;
          index++;
          this.setIndexesAndBackReferences(child, category_id);
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

  getCatPos(category, scale= true) {
    const state = this.getState(category);
    let nodeCount = category.parent.children.length;
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
    let index = category.index;
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
    /* navigate to another page if a 3rd level category is clicked when it's parent category
    is active (it's in a secondary state).  Otherwise, make the parent category active. */
    this.location.replaceState(`/network/${c.id}`);
    if (c.level === 2) {
      if (this.getState(c) === 'secondary') {
        this.router.navigate(['category', c.id]);
      } else {
        this.selectedCategory = c.parent;
        this.transitionState = 'moving';
      }
    } else if (c !== this.selectedCategory) {
      this.selectedCategory = c;
      this.transitionState = 'moving';
    }
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
    } else if (node.parent && node.parent.parent && this.selectedCategory.id === node.parent.parent.id) {
      return 'tertiary';
    } else {
      return 'nary';
    }
  }

  getMenuState(node) {
    if (this.category === node) {
      return 'selected';
    } else {
      return 'unselected';
    }
  }

  getMenuPosition(node) {
    const x = -(this.layoutWidth / 2) + this.navRadius * 3 * (node.index + 1);
    const y = -(this.layoutHeight / 2) + this.navRadius * 1.5;
    return {x: x, y: y};
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
      return {x: 0, y: 0};
    }
    const position = this.getCatPos(this.selectedCategory);
    position.x = -position.x;
    position.y = -position.y;
    return position;
  }

  setCategory(c: Category) {
   if (c !== this.selectedCategory) {
      this.category = c;
      this.selectedCategory = c;
      this.transitionState = 'moving';
    }
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }
}
