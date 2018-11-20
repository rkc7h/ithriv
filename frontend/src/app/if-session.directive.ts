import { Directive, OnInit, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { ResourceApiService } from './shared/resource-api/resource-api.service';

@Directive({
  selector: '[appIfSession]'
})
export class IfSessionDirective implements OnInit {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private api: ResourceApiService) {
  }

  ngOnInit(): void {
    this.applyPermission();
  }

  private applyPermission(): void {
    this.api.getSession().subscribe(user => {
      if (user) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    },
      error1 => {
        this.viewContainer.clear();
      });
  }
}
