import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import { NodeOptions } from '../node-options';
import { hexColorToRGBA } from '../shared/color';
import { zoomTransition } from '../shared/router.animations';

@Component({
  selector: '[app-network-view-node]',
  templateUrl: './network-view-node.component.html',
  styleUrls: ['./network-view-node.component.scss'],
  animations: [zoomTransition()]
})
export class NetworkViewNodeComponent implements OnInit {
  @HostBinding('@zoomTransition')
  @Input() category: Category;
  @Input() numTotal: number;
  @Input() options: NodeOptions;
  strokeWidth = 4;
  iconSize = 24;
  fontSize = 16;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goCategory(c: Category) {
    if (c.level === 2) {
      this.router.navigate(['category', c.id]);
    } else {
      this.router.navigate(['category', c.id, 'network']);
    }
  }

  rotate(angle: number) {
    return `rotate(${angle})`;
  }

  scale(factor: number) {
    return `scale(${factor})`;
  }

  translate(x: number, y: number) {
    return `translate(${x}, ${y})`;
  }

  translateAndScale() {
    const scale = this.category.hover ? 1.1 : 1;
    return `
      ${this.translate(this.options.x, this.options.y)}
      ${this.scale(scale)}
    `;
  }

  categoryColor(hexColor: string, alpha = 1) {
    return hexColorToRGBA(hexColor, alpha);
  }

  nodeGradient(node: Category) {
    return `url(#linear-${node.id})`;
  }

  nodeImageSize() {
    return (this.options.radius - this.strokeWidth) * 2 - this.strokeWidth;
  }

  nodeImagePath(c: Category) {
    return `/assets/browse/${c.image}`;
  }

  words(str: string) {
    return str.trim()
      .replace('  ', ' ')
      .replace(/ to /i, '_to ')
      .replace(/ and /i, '_& ')
      .split(' ')
      .map(s => s.replace('_&', ' &').replace('_to', ' to'));
  }

  translateText(c: Category) {
    const scale = (this.options.relationship === 'self') ? 2 : 1;
    if (c.level === 1) {
      return `translate(0, ${this.iconSize * scale})`;
    } else {
      return `translate(0, -${this.fontSize})`;
    }
  }

  translateIcon() {
    const scale = 3;
    const xOffset = this.options.x - this.iconSize * scale / 2;
    const yOffset = -this.iconSize * (scale - 0.5);
    return `
      ${this.translate(xOffset, yOffset)}
      ${this.scale(scale)}
    `;
  }

}
