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
  movingTransition,
  menuTransition,
  rootTransition
} from '../animations';
import { NodeLoadingStatus } from '../../node-loading-status';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  animations: [
    menuTransition(),
    rootTransition(),
    childPositionTransition(),
    grandchildPositionTransition(),
    movingTransition()
  ]
})
export class GraphComponent {
  topCategories: Category[] = [];
  selectedCategory: Category;
  layoutWidth = 982;
  layoutHeight = 982;
  baseRadius = 80;
  navRadius = 40;
  parentTitleHeight = 30;
  transitionState = 'moving';

  isDataLoaded = false;
  menuLoaded = false;
  rootLoaded = false;
  childrenLoaded = false;
  grandchildrenLoaded = false;

  loadingStatus = new Map<number, NodeLoadingStatus>();

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

  setInitialCategory(c: Category) {
    switch (c.level) {
      case 0:
        // this.category = c;
        this.selectedCategory = c;
        break;
      case 1:
        // this.category = c.parent;
        this.selectedCategory = c;
        break;
      case 2:
        // this.category = c.parent.parent;
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
        if (!this.selectedCategory) {
          this.setCategory(this.topCategories[0]);
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

  getCatPos(category, scale = true) {
    if (category.parent) {
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
      const options = this.calcCoords(angle, radius);

      return { x: options.x, y: options.y };
    } else {
      return { x: 0, y: 0 };
    }
  }

  selectCategory(c: Category) {
    this.resetAnimations();

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
  }

  transitionCallback(from: string, node?: Category) {
    this.transitionState = from;

    switch (from) {
      case 'menuDone':
        this.menuLoaded = true;
        break;
      case 'rootDone':
        this.rootLoaded = true;
        break;
      case 'childDone':
        this.childrenLoaded = true;
        break;
      case 'grandchildDone':
        this.grandchildrenLoaded = true;
        break;

      default:
        break;
    }



    if ((from === 'childDone') && node && node.id) {
      if (node.parent && node.parent.id) {
        const status = this.getLoadingStatus(node.parent);
        status.numChildrenLoaded++;
        this.loadingStatus.set(node.parent.id, status);
      }
    }
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

  getMenuState(node) {
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

  getLoadingStatus(node) {
    if (!this.loadingStatus.has(node.id)) {
      const status = {
        numChildren: node.children ? node.children.length : 0,
        numChildrenLoaded: 0
      };
      this.loadingStatus.set(node.id, new NodeLoadingStatus(status));
    }
    return this.loadingStatus.get(node.id);
  }

  getTopCategories() {
    return this.menuLoaded ? this.topCategories : [];
  }

  getChildren(node: Category, wait: boolean) {
    const loadNow = wait ? this.childrenLoaded : this.rootLoaded;
    if (loadNow && node && node.children && (node.children.length > 0)) {
      const status = this.getLoadingStatus(node);
      status.numChildren = node.children.length;
      this.loadingStatus.set(node.id, status);
      return node.children;
    }
    return [];
  }

  getGrandchildren(node: Category, wait: boolean) {
    const loadNow = wait ? this.grandchildrenLoaded : this.childrenLoaded;
    if (loadNow && node && node.children && (node.children.length > 0)) {
      if (node.parent && node.parent.id) {
        const status = this.getLoadingStatus(node.parent);
        if (status.numChildrenLoaded >= status.numChildren) {
          return node.children;
        }
      }
    }

    return [];
  }

  getRootState(node: Category) {
    if (node && this.selectedCategory) {

      let topLevelNode = this.selectedCategory;

      while (topLevelNode.level > 0) {
        topLevelNode = topLevelNode.parent;
      }

      if (topLevelNode.id !== node.id) {
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
  getRootShift(node: Category) {
    if (this.selectedCategory && (this.selectedCategory.id === node.id)) {
      return { x: 0, y: 0 };
    }
    const position = this.getCatPos(this.selectedCategory);
    position.x = -position.x;
    position.y = -position.y;
    return position;
  }

  setCategory(nextCategory: Category) {
    this.resetAnimations();

    if (nextCategory && nextCategory.id) {
      if (nextCategory !== this.selectedCategory) {
        this.selectedCategory = nextCategory;
      }
    }
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

  resetAnimations() {
    this.transitionState = 'moving';
    this.loadingStatus.clear();
    this.childrenLoaded = false;
    this.grandchildrenLoaded = false;
  }

  drawLines() {
    return this.grandchildrenLoaded;
  }
}
