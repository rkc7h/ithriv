import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Icon } from './icon';
import { MatIconRegistry } from '@angular/material';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { routerTransition } from './shared/router.animations';
import { RouterOutlet } from '../../node_modules/@angular/router';

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
    private api: ResourceApiService
  ) {
    this.trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl;
    this.loadIcons();
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
