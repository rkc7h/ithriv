import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {ResourceApiService} from './shared/resource-api/resource-api.service';

@Directive({
  selector: '[appIsAdmin]'
})
export class IsAdminDirective implements OnInit {

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private api: ResourceApiService) {
  }

  ngOnInit(): void {
    this.applyPermission();
  }

  private applyPermission(): void {
    console.log('Applying Permission');
    this.api.getSession().subscribe(user => {
        console.log('current user:' + JSON.stringify(user));
        if (user && user.role === 'Admin') {
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
