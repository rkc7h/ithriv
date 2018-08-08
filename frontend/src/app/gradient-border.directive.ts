import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { hexColorToRGBA } from './shared/color';

@Directive({
  selector: '[appGradientBorder]'
})
export class GradientBorderDirective implements OnChanges {

  @Input('appGradientBorder') color: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnChanges() {
    const fromColor = hexColorToRGBA(this.color, 0);
    const toColor = hexColorToRGBA(this.color, 1);
    const gradient = `linear-gradient(to bottom, ${fromColor}, ${toColor})`;
    this.renderer.setStyle(this.el.nativeElement, 'border-image', gradient);
  }
}
