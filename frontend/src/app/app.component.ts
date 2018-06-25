import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public constructor(
    public iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    const trustUrl = this.sanitizer.bypassSecurityTrustResourceUrl;

    // !!! TO DO: RETRIEVE LIST OF ICON FILES FROM SERVICE VIA HTTP

    iconRegistry
      .addSvgIcon(
        'ithriv_admin_tools',
        trustUrl('/assets/categories/admin_tools.svg')
      )
      .addSvgIcon(
        'ithriv_ancillary_service',
        trustUrl('/assets/categories/ancillary_service.svg')
      )
      .addSvgIcon(
        'ithriv_center',
        trustUrl('/assets/categories/center.svg')
      )
      .addSvgIcon(
        'ithriv_certificate',
        trustUrl('/assets/categories/certificate.svg')
      )
      .addSvgIcon(
        'ithriv_clinical_translational',
        trustUrl('/assets/categories/clinical_translational.svg')
      )
      .addSvgIcon(
        'ithriv_communicate',
        trustUrl('/assets/categories/communicate.svg')
      )
      .addSvgIcon(
        'ithriv_community',
        trustUrl('/assets/categories/community.svg')
      )
      .addSvgIcon(
        'ithriv_data_management',
        trustUrl('/assets/categories/data_management.svg')
      )
      .addSvgIcon(
        'ithriv_data_science',
        trustUrl('/assets/categories/data_science.svg')
      )
      .addSvgIcon(
        'ithriv_design',
        trustUrl('/assets/categories/design.svg')
      )
      .addSvgIcon(
        'ithriv_facility',
        trustUrl('/assets/categories/facility.svg')
      )
      .addSvgIcon(
        'ithriv_funding',
        trustUrl('/assets/categories/funding.svg')
      )
      .addSvgIcon(
        'ithriv_grant',
        trustUrl('/assets/categories/grant.svg')
      )
      .addSvgIcon(
        'ithriv_grants',
        trustUrl('/assets/categories/grants.svg')
      )
      .addSvgIcon(
        'ithriv_logistics',
        trustUrl('/assets/categories/logistics.svg')
      )
      .addSvgIcon(
        'ithriv_management',
        trustUrl('/assets/categories/management.svg')
      )
      .addSvgIcon(
        'ithriv_participate',
        trustUrl('/assets/categories/participate.svg')
      )
      .addSvgIcon(
        'ithriv_regulations',
        trustUrl('/assets/categories/regulations.svg')
      )
      .addSvgIcon(
        'ithriv_research_reg',
        trustUrl('/assets/categories/research_reg.svg')
      )
      .addSvgIcon(
        'ithriv_special_topic',
        trustUrl('/assets/categories/special_topic.svg')
      )
      .addSvgIcon(
        'ithriv_training',
        trustUrl('/assets/categories/training.svg')
      )
      .addSvgIcon(
        'ithriv_writing',
        trustUrl('/assets/categories/writing.svg')
      );
  }
}

