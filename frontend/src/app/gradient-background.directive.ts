import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { hexColorToRGBA } from './shared/color';

@Directive({
  selector: '[appGradientBackground]'
})
export class GradientBackgroundDirective implements OnChanges {

  @Input('appGradientBackground') color: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnChanges() {
    const fromColor = hexColorToRGBA(this.color, 1);
    const toColor = hexColorToRGBA(this.color, 0);
    const background = `linear-gradient(to right, ${fromColor}, ${fromColor} 50%, ${toColor} 75%)`;
    this.renderer.setStyle(this.el.nativeElement, 'background', background);
  }
}
