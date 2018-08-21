import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2
} from '@angular/core';
import { Resource } from './resource';

@Directive({
  selector: '[appCategoryColorBorder]'
})
export class CategoryColorBorderDirective implements OnChanges {
  @Input('appCategoryColorBorder') resource: Resource;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnChanges() {
    const gradient = this.getGradient(this.resource);
    this.renderer.setStyle(this.el.nativeElement, 'background-image', gradient);
  }

  getGradient(resource: Resource): string {
    if (resource && resource.resource_categories) {
      const numCategories = resource.resource_categories.length;

      if (numCategories > 0) {
        const percent = 100 / numCategories;
        const colors = resource.resource_categories.map((rc, i) => {
          return `
          ${rc.category.color} ${i * percent}%,
          ${rc.category.color} ${(i + 1) * percent}%
        `;
        });

        return `linear-gradient(to right,${colors.join(',')})`;
      }
    }

    return 'linear-gradient(to right, #999 0%, #999 100%)';
  }

}
