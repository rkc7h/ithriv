import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Icon } from './icon';
import { MatIconRegistry } from '@angular/material';
import { ResourceApiService } from './resource-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  trustUrl;

  public constructor(
    public iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private api: ResourceApiService
  ) {
    this.trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl;
    this.loadIconRegistry();
  }

  loadIconRegistry() {
    this.api.getIcons().subscribe(icons => {
      for (const key in icons) {
        if (icons.hasOwnProperty(key)) {
          this.registerIcon(icons[key]);
        }
      }
    });
  }

  registerIcon(icon: Icon) {
    this.iconRegistry.addSvgIcon(
      `ithriv_${icon.id}`,
      this.trustUrl(icon.url)
    );
  }
}

