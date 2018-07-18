import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivationEnd, ActivationStart, Router, RouterOutlet } from '../../node_modules/@angular/router';
import { Icon } from './icon';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { routerTransition } from './shared/router.animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition()],
})
export class AppComponent {
  trustUrl;
  title = 'iThriv';
  icons: Icon[];

  public constructor(
    public iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private api: ResourceApiService,
    private router: Router,
    private titleService: Title
  ) {
    this.trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl;
    this.loadIcons();
    this.router.events.subscribe((e) => {
      if (e instanceof ActivationStart || e instanceof ActivationEnd) {
        if (e.snapshot && e.snapshot.data) {
          const data = e.snapshot.data;
          this.title = data.title ? `iThriv - ${data.title}` : 'iThriv';
          this.titleService.setTitle(this.title);
        }
      }
    });
  }

  loadIcons() {
    this.api.getIcons().subscribe(icons => {
      this.icons = icons;
      this.loadIconRegistry();
    });
  }

  loadIconRegistry() {
    for (const key in this.icons) {
      if (this.icons.hasOwnProperty(key)) {
        this.registerIcon(this.icons[key]);
      }
    }
  }

  registerIcon(icon: Icon) {
    this.iconRegistry.addSvgIcon(
      `ithriv_${icon.id}`,
      this.trustUrl(icon.url)
    );
  }

  getState(outlet: RouterOutlet) {
    return outlet.activatedRouteData.state;
  }

}
