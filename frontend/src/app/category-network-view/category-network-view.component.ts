import { Component, HostBinding, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition, zoomTransition } from '../shared/router.animations';

@Component({
  selector: 'app-category-network-view',
  templateUrl: './category-network-view.component.html',
  styleUrls: ['./category-network-view.component.scss'],
  animations: [routerTransition(), zoomTransition()]
})
export class CategoryNetworkViewComponent implements OnInit {
  @HostBinding('@routerTransition')
  isDataLoaded = false;

  @HostBinding('@zoomTransition')
  categoryId: number;
  category: Category;
  allCategories: Category[];

  layoutWidth = 982;
  layoutHeight = 982;
  navRadius = 40;
  selfRadius = 90;
  parentRadius = 70;
  nodeRadius = 70;
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
        this.isDataLoaded = true;
      }
    );
  }

  ngOnInit() {
  }

  private rotateChildDegrees(i: number, numTotal: number, rotateMultiplier = 1) {
    if (numTotal > 0) {
      return (i * 360 / numTotal) + (this.rootNodeAngle * rotateMultiplier);
    }

    return 0;
  }

  rotateChild(i: number, numTotal: number, mode: string) {
    if (numTotal > 0) {
      const rotateMultiplier = (mode === 'siblings') ? -2 : 1;
      return `rotate(${this.rotateChildDegrees(i, numTotal, rotateMultiplier)})`;
    }
  }

  unrotateChild(c: Category, i: number, numTotal: number, mode: string) {
    if (this.category.children.length > 0) {
      const scale = c.hover ? 1.1 : 1;
      const offset = (this.nodeLineLength(c, i) + this.nodeRadius) * scale;
      const rotateMultiplier = (mode === 'siblings') ? -2 : 1;
      return `rotate(${-this.rotateChildDegrees(i, numTotal, rotateMultiplier)}, ${offset}, 0) scale(${scale})`;
    }
  }

  isParentNode(node: Category) {
    return node.level < this.category.level;
  }

  categoryNodes(category: Category) {
    if (category.parent) {
      return [category.parent].concat(category.children);
    } else if (category.children && (category.children.length > 0)) {
      return category.children;
    } else {
      return [];
    }
  }

  nodeLineLength(node: Category, i: number) {
    if (this.isParentNode(node) && (i === 0)) {
      return this.selfRadius + this.nodeRadius * 2;
    } else {
      return this.selfRadius + this.nodeRadius;
    }
  }

  goCategory(c: Category) {
    if (c.level === 2) {
      this.router.navigate(['category', c.id]);
    } else {
      this.router.navigate(['category', c.id, 'network']);
    }
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }

  translateByIndex(i: number) {
    const numNodes = this.allCategories.length;
    return `translate(${-(numNodes - i) * this.nodeRadius * 2}, ${this.nodeRadius})`;
  }

  translateTo(s: string, node: Category, i: number) {
    switch (s) {
      case 'origin':
        return `translate(0, 0)`;
      case 'top-right':
        return `translate(${this.layoutWidth / 2}, ${-this.layoutHeight / 2})`;
      case 'node':
        return `translate(${this.nodeLineLength(node, i) + this.nodeRadius})`;
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
        for (const sib of rootCat.children) {
          if (sib.id === this.category.id) {
            sibs.push(sib);
          } else {
            sibs.unshift(sib);
          }
        }
      }
    }

    return sibs;
  }
}
