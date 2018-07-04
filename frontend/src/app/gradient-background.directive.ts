import {Directive, ElementRef, Input, OnChanges, OnInit, Renderer2} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';

@Directive({
  selector: '[appGradientBackground]'
})
export class GradientBackgroundDirective implements OnChanges {

  @Input('appGradientBackground') color: string;

  constructor(private el: ElementRef,
              private deviceService: DeviceDetectorService,
              private renderer: Renderer2) {}

  rgb(opacity) {
    let hex = this.color;
    return 'rgba(' + (hex = hex.replace('#', '')).match(
      new RegExp('(.{' + hex.length / 3 + '})', 'g')).map(function(l) {
        return parseInt(hex.length % 2 ? l + l : l, 16);
      })
      .concat(opacity).join(',') + ')';
    }

  ngOnChanges() {
    //TODO:  Add device detection and provide browser prefix styles if required.
    const background = `linear-gradient(to right, ${this.rgb(1)}, ${this.rgb(1)} 50%, ${this.rgb(0)} 75%)`;
    const works = 'linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)';
    this.renderer.setStyle(this.el.nativeElement, 'background', background);
  }
}
