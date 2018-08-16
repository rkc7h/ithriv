import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { NodeOptions } from '../node-options';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-category-network-view',
  templateUrl: './category-network-view.component.html',
  styleUrls: ['./category-network-view.component.scss']
})
export class CategoryNetworkViewComponent implements OnInit {
  isDataLoaded = false;
  transitionState = 'default';
  transitionClass = '';

  categoryId: number;
  category: Category;
  allCategories: Category[];

  layoutWidth = 982;
  layoutHeight = 982;
  navRadius = 40;
  selfRadius = 100;
  parentRadius = 75;
  nodeRadius = 75;
  nodeSpacing = 60;
  nodeChildRadius = 15;
  rootNodeAngle = 35;
  selfTitleHeight = 40;
  parentTitleHeight = 30;
  strokeWidth = 4;
  iconSize = 24;
  fontSize = 16;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private titleService: Title
  ) {
    this.route.params.subscribe(params => {
      this.isDataLoaded = false;
      this.categoryId = params['category'];
      this.loadRootCategories();
    });
  }

  loadRootCategories() {
    this.api.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.loadCategory(this.categoryId);
    });
  }

  loadCategory(categoryId: Number) {
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.category.name}`);

        if (this.transitionClass) {
          this.transitionClass = this.transitionClass.replace('exit', 'enter');
        } else {
          this.transitionClass = 'fade-enter';
        }

        this.isDataLoaded = true;
      }
    );
  }

  ngOnInit() {
  }

  private rotateChildDegrees(i: number, numTotal: number, angleMultiplier = 1) {
    if (numTotal > 0) {
      return (i * 360 / numTotal) + (this.rootNodeAngle * angleMultiplier);
    }

    return 0;
  }

  rotateChild(i: number, numTotal: number, mode: string) {
    if (numTotal > 0) {
      const angleMultiplier = (mode === 'siblings') ? -2 : 1;
      return `rotate(${this.rotateChildDegrees(i, numTotal, angleMultiplier)})`;
    }
  }

  unrotateChild(c: Category, i: number, numTotal: number, mode: string) {
    if (this.category.children.length > 0) {
      const scale = c.hover ? 1.1 : 1;
      const offset = (this.nodeLineLength(c, i) + this.nodeRadius) * scale;
      const angleMultiplier = (mode === 'siblings') ? -2 : 1;
      return `rotate(${-this.rotateChildDegrees(i, numTotal, angleMultiplier)}, ${offset}, 0) scale(${scale})`;
    }
  }

  isParentNode(node: Category) {
    return node.level < this.category.level;
  }

  categoryNodes(category: Category, noParent: boolean): Category[] {
    const nodes = (category.parent && !noParent) ? [category.parent].concat(category.children) : category.children;
    const multiplier = noParent ? 0.44 : 1;

    if (nodes && nodes.length > 0) {
      return nodes.map((n, i) => {
        n.options = new NodeOptions(this.nodeCoords(n, i, nodes.length, multiplier));
        return n;
      });
    } else {
      return [];
    }
  }

  nodeLineLength(node: Category, i: number, multiplier = 1) {
    if (this.isParentNode(node) && (i === 0)) {
      return multiplier * (this.selfRadius + this.nodeRadius * 2 + this.nodeSpacing);
    } else {
      return multiplier * (this.selfRadius + this.nodeRadius + this.nodeSpacing);
    }
  }

  goCategory(c: Category) {
    if (c.level === this.category.level) {
      this.transitionState = 'default';
    } else {
      this.transitionState = (c.level > this.category.level) ? 'zoomOut' : 'zoomIn';
    }

    if (c.level === 2) {
      this.router.navigate(['category', c.id]);
    } else {
      this.router.navigate(['category', c.id, 'network']);
    }
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }

  translate(x = 0, y = 0) {
    return `translate(${x}, ${y})`;
  }

  translateByIndex(i: number) {
    const padding = this.nodeSpacing / 2;
    const xOffset = padding + i * (this.navRadius * 2 + this.nodeSpacing);
    const yOffset = this.navRadius + padding;
    return this.translate(xOffset, yOffset);
  }

  translateTo(s: string, node: Category, i: number) {
    switch (s) {
      case 'origin':
        return `translate(0, 0)`;
      case 'top-left':
        return this.translate(-this.layoutWidth / 2, -this.layoutHeight / 2);
      case 'top-right':
        return this.translate(this.layoutWidth / 2, -this.layoutHeight / 2);
      case 'node':
        return this.translate(this.nodeLineLength(node, i) + this.nodeRadius, 0);
      default:
        break;
    }
  }

  viewBoxDimensions() {
    return `${-this.layoutWidth / 2} ${-this.layoutHeight / 2} ${this.layoutWidth} ${this.layoutHeight}`;
  }

  isSelectedCategory(node: Category) {
    if (node.id === this.category.id) { return true; }
    if (this.category.parent && (node.id === this.category.parent.id)) { return true; }
  }

  siblings(node: Category): Category[] {
    const sibs: Category[] = [];

    for (const rootCat of this.allCategories) {
      if (node.id === rootCat.id) {
        rootCat.children.forEach(sib => {
          if (sib.id === this.category.id) {
            sibs.push(sib);
          } else {
            sibs.unshift(sib);
          }
        });
      }
    }

    const radiusMultiplier = 0.6;
    const angleMultiplier = -sibs.length / 2.5;

    return sibs.map((sib, i) => {
      sib.options = new NodeOptions(this.nodeCoords(sib, i, sibs.length, radiusMultiplier, angleMultiplier));
      return sib;
    });
  }

  nodeCoords(node: Category, i: number, numTotal: number, radiusMultiplier = 1, angleMultiplier = 1): NodeOptions {
    const r = this.nodeLineLength(node, i, radiusMultiplier);
    const angle = this.rotateChildDegrees(i, numTotal, angleMultiplier);
    return this.calcCoords(angle, r);
  }

  // Get x,y coordinates of a point at given angle on a circle of radius r.
  calcCoords(angle = 0, r = 0): NodeOptions {

    // Convert degrees to radians
    const theta = angle * Math.PI / 180;

    // x is adjacent, r is hypoteneuse
    const x = Math.cos(theta) * r;

    // y is opposite, r is hypoteneuse
    const y = Math.sin(theta) * r;

    return new NodeOptions({ x: x, y: y });
  }

  getTransitionState() {
    return this.transitionState;
  }

  setTransitionClass(nextNode: Category, nodes: Category[]) {
    if (nextNode.level > this.category.level) {
      this.transitionClass = 'zoom-in-exit';
    } else if (nextNode.level < this.category.level) {
      this.transitionClass = 'zoom-out-exit';
    } else {
      let currentIndex: number;
      let nextIndex: number;

      nodes.forEach((n, i) => {
        if (n.id === this.category.id) {
          currentIndex = i;
        } else if (n.id === nextNode.id) {
          nextIndex = i;
        }
      });

      if (nextIndex < currentIndex) {
        this.transitionClass = 'slide-right-exit';
      } else if (currentIndex < nextIndex) {
        this.transitionClass = 'slide-left-exit';
      } else {
        this.transitionClass = 'fade-exit';
      }
    }
  }
}
