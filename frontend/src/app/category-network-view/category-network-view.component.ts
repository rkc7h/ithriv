import { Component, HostBinding, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import { User } from '../user';

@Component({
  selector: 'app-category-network-view',
  templateUrl: './category-network-view.component.html',
  styleUrls: ['./category-network-view.component.scss'],
  animations: [routerTransition()],
})
export class CategoryNetworkViewComponent implements OnInit {
  @HostBinding('@routerTransition')
  isDataLoaded = false;
  categoryId: number;
  category: Category;
  allCategories: Category[];
  user: User;
  resourceCounts = {};

  layoutWidth = 982;
  layoutHeight = 982; // 642;
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
      this.categoryId = params['category'];
      this.loadRootCategories();
      this.loadCategory(this.categoryId);
    });
  }

  loadRootCategories() {
    this.api.getCategories().subscribe(cats => this.allCategories = cats);
  }

  loadCategory(categoryId: Number) {
    this.isDataLoaded = false;
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.category.name}`);
        this.loadCategoryResources(category);
      }
    );
  }

  loadCategoryResources(c: Category) {
    if (c.level === 1) {
      c.children.forEach(child => {
        this.resourceCounts[child.id] = 0;

        this.api.getCategoryResources(child).subscribe(resources => {
          resources.forEach(i => {
            const currentNum = this.resourceCounts[child.id];
            this.resourceCounts[child.id] = isFinite(currentNum) ? currentNum + 1 : 0;
          });
        });
      });
    }
    this.isDataLoaded = true;
  }

  ngOnInit() {
  }

  private rotateChildDegrees(i: number, numTotal: number) {
    if (numTotal > 0) {
      return i * 360 / numTotal + this.rootNodeAngle;
    }

    return 0;
  }

  rotateChild(i: number, numTotal: number) {
    if (numTotal > 0) {
      return `rotate(${this.rotateChildDegrees(i, numTotal)})`;
    }
  }

  unrotateChild(c: Category, i: number, numTotal: number) {
    if (this.category.children.length > 0) {
      const scale = c.hover ? 1.1 : 1;
      const offset = (this.nodeLineLength(c, i) + this.nodeRadius) * scale;
      return `rotate(${-this.rotateChildDegrees(i, numTotal)}, ${offset}, 0) scale(${scale})`;
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

  childPosX(i: number) {
    return 20 * (i + 1);
  }

  childPosY(i: number) {
    return 20 * (i + 1);
  }

  words(str: string) {
    return str.trim()
      .replace('  ', ' ')
      .replace(/ to /i, '_to ')
      .replace(/ and /i, '_& ')
      .split(' ')
      .map(s => s.replace('_&', ' &').replace('_to', ' to'));
  }

  goCategory(c: Category) {
    if (c.level === 2) {
      this.router.navigate(['category', c.id]);
    } else {
      this.router.navigate(['category', c.id, 'network']);
    }
  }

  backgroundImage(c: Category) {
    return `url('/assets/browse/${c.image}')`;
  }

  nodeImageSize(mode: string) {
    const key = mode + 'Radius';

    if (this.hasOwnProperty(key)) {
      return (this[key] - this.strokeWidth) * 2 - this.strokeWidth;
    }
  }

  nodeImagePath(c: Category) {
    return `/assets/browse/${c.image}`;
  }

  nodeIconUrl(c: Category) {
    const url = c && c.icon && c.icon.url;
    if (url) {
      return `url('${url}')`;
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

  translateIcon(c: Category, i: number) {
    if (isFinite(i)) {
      const xOffset = this.nodeLineLength(c, i) + this.nodeRadius - this.iconSize;
      const yOffset = -(this.nodeRadius - this.iconSize / 2);
      return `translate(${xOffset}, ${yOffset}) scale(2)`;
    } else {
      return `translate(-${this.iconSize * 2}, -${this.iconSize * 3}) scale(4)`;
    }
  }

  translateText(c: Category) {
    const scale = (this.category.id === c.id) ? 2 : 1;
    if (c.level === 1) {
      return `translate(0, ${this.iconSize * scale})`;
    } else {
      return `translate(0, -${this.fontSize})`;
    }
  }

  viewBoxDimensions() {
    return `${-this.layoutWidth / 2} ${-this.layoutHeight / 2} ${this.layoutWidth} ${this.layoutHeight}`;
  }

  isSelectedCategory(node: Category) {
    if (node.id === this.category.id) { return true; }
    if (this.category.parent && (node.id === this.category.parent.id)) { return true; }
  }

  nodeGradient(node: Category) {
    return `url(#linear-${node.id})`;
  }

  numResources(node: Category) {
    if (this.resourceCounts.hasOwnProperty(node.id)) {
      return this.resourceCounts[node.id];
    }
  }
}
