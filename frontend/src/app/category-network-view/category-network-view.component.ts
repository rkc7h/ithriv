import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { CategoryResource } from '../category-resource';
import { hexColorToRGBA } from '../shared/color';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-category-network-view',
  templateUrl: './category-network-view.component.html',
  styleUrls: ['./category-network-view.component.scss']
})
export class CategoryNetworkViewComponent implements OnInit {
  categoryId: number;
  category: Category;
  allCategories: Category[];
  categoryResources: CategoryResource[];
  isDataLoaded = false;
  user: User;

  layoutWidth = 982;
  layoutHeight = 982; // 642;
  navRadius = 40;
  selfRadius = 90;
  parentRadius = 70;
  nodeRadius = 70;
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
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        console.log('loadCategory category', category);
        this.category = category;

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.category.name}`);
      }
    );
  }

  ngOnInit() {
  }

  private rotateChildDegrees(i: number) {
    if (this.category.children.length > 0) {
      const numNodes = this.categoryNodes(this.category).length;
      return i * 360 / numNodes + this.rootNodeAngle;
    }

    return 0;
  }

  rotateChild(i: number) {
    if (this.category.children.length > 0) {
      return `rotate(${this.rotateChildDegrees(i)})`;
    }
  }

  unrotateChild(c: Category, i: number) {
    if (this.category.children.length > 0) {
      const offset = this.nodeLineLength(c, i) + this.nodeRadius;
      return `rotate(${-this.rotateChildDegrees(i)}, ${offset}, 0)`;
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

  words(s: string) {
    return s.trim().split(' ');
  }

  goCategory(c: Category) {
    this.router.navigate(['category', c.id, 'network']);
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

  translateTo(s: string) {
    switch (s) {
      case 'origin':
        return `translate(0, 0)`;
        break;

      case 'top-right':
        return `translate(${this.layoutWidth / 2}, ${-this.layoutHeight / 2})`;
        break;

      default:
        break;
    }
  }

  translateIcon(c: Category, i: number) {
    const xOffset = this.nodeLineLength(c, i) + this.nodeRadius - this.iconSize;
    const yOffset = -(this.nodeRadius - this.iconSize / 2);
    return `translate(${xOffset}, ${yOffset}) scale(2)`;
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
}
