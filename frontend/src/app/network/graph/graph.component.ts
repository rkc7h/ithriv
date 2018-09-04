import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../category';
import { NodeOptions } from '../../node-options';
import { hexColorToRGBA } from '../../shared/color';
import { ResourceApiService } from '../../shared/resource-api/resource-api.service';
import {
  childPositionTransition,
  grandchildPositionTransition,
  lineTransition,
  menuTransition,
  rootTransition
} from '../animations';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [
    menuTransition(),
    rootTransition(),
    childPositionTransition(),
    grandchildPositionTransition(),
    lineTransition()
  ]
})
export class GraphComponent {
  level0Categories: Category[] = [];
  selectedCategory: Category;
  topLevelNode: Category;
  layoutWidth = 982;
  layoutHeight = 982;
  baseRadius = 80;
  navRadius = 40;
  parentTitleHeight = 30;
  isDataLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private location: Location,
    private titleService: Title
  ) {

    this.route.params.subscribe(params => {
      if (params && params.hasOwnProperty('category')) {
        this.loadRootCategories(Number(params['category']));
      } else {
        this.loadRootCategories();
      }
    });
  }

  loadRootCategories(category_id = -1) {
    this.api.getCategories().subscribe(cats => {
      this.level0Categories = cats;
      let index = 0;
      for (const c of this.level0Categories) {
        c.index = index;
        index++;
        this.setIndexesAndBackReferences(c, category_id);
        if (!this.selectedCategory) {
          this.selectCategory(this.level0Categories[0]);
        }
        this.isDataLoaded = true;
      }
    });
  }

  // Recursive madness, beware.
  // This assures that a parent refers to the same exact object as
  // the element with children.
  setIndexesAndBackReferences(c: Category, category_id: Number) {
    let index = 0;
    // Set the selected category
    if (c.id === category_id) {
      this.selectCategory(c);
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
    const w = this.layoutWidth;
    const h = this.layoutHeight;
    return `${-w / 2} ${-h / 2} ${w} ${h}`;
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

  getRadiusMultiplier(state: string, scale = true) {
    switch (state) {
      case 'primary':
        return (scale ? 4.5 : 3);
      case 'secondary':
        return 3;
      case 'tertiary':
        return (scale ? 5.5 : 1.5);
      default:
        return 0;
    }
  }

  getCatPos(category: Category, scale = true): NodeOptions {
    if (category.level > 0) {
      const state = this.getState(category);
      let nodeCount = category.parent.children.length;
      const radius = this.baseRadius * this.getRadiusMultiplier(state, scale);

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
      return this.calcCoords(angle, radius);
    } else {
      return new NodeOptions({ x: 0, y: 0 });
    }
  }

  selectCategory(c: Category) {
    /* navigate to another page if a 3rd level category is clicked when its parent category
    is active (it's in a secondary state).  Otherwise, make the parent category active. */
    this.location.replaceState(`/network/${c.id}`);
    if (c.level === 2) {
      if (this.getState(c) === 'secondary') {
        this.router.navigate(['category', c.id]);
      } else {
        this.selectedCategory = c.parent;
      }
    } else if (c !== this.selectedCategory) {
      this.selectedCategory = c;
    }

    this.setTopLevelNode();
  }

  /**
   * This node is the primary node, if it is the selected node.
   * It is secondary if it is a child or parent of the currently selected node.
   * otherwise it is tertiary if it is the child or parent of a secondary node.
   * HOWEVER, mark tertiary as nary if we aren't viewing the primary node.
   * @param {Category} node
   * @returns {string}
   */
  getState(node: Category) {
    if (node && node.id && this.selectedCategory && this.selectedCategory.id) {
      if (this.selectedCategory.id === node.id) {
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
      }
    }

    return 'nary';
  }

  getMenuState(node: Category): string {
    if (this.selectedCategory === node) {
      return 'selected';
    } else {
      return 'unselected';
    }
  }

  getMenuPosition(node: Category) {
    const x = -(this.layoutWidth / 2) + this.navRadius * 3 * (node.index + 1);
    const y = -(this.layoutHeight / 2) + this.navRadius * 1.5;
    return { x: x, y: y };
  }

  getRootState(node: Category): string {
    if (node && this.selectedCategory) {

      if (this.topLevelNode.id !== node.id) {
        return 'parked';
      } else if (this.selectedCategory.level === 0) {
        return 'root';
      } else {
        return 'child';
      }
    }

    return 'parked';
  }

  /**
   * Calculate the center of the currently selected node.
   */
  getRootShift(node: Category): NodeOptions {
    if (this.selectedCategory && (this.selectedCategory.id === node.id)) {
      return new NodeOptions({ x: 0, y: 0 });
    }
    const position = this.getCatPos(this.selectedCategory);
    position.x = -position.x;
    position.y = -position.y;
    return position;
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }

  showTooltip(node: Category): boolean {
    if (node && this.selectedCategory && (node.id !== this.selectedCategory.id)) {
      return ((node.level === 1) && (this.selectedCategory.level === 1));
    }

    return false;
  }

  setTopLevelNode() {
    let topLevelNode = this.selectedCategory;

    while (topLevelNode.level > 0) {
      topLevelNode = topLevelNode.parent;
    }

    this.topLevelNode = topLevelNode;
  }
}
