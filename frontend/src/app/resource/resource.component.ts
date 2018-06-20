import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resource } from '../resource';
import { ResourceApiService } from '../resource-api.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {
  resourceId: number;
  @Input() resource: Resource;

  isDataLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private api: ResourceApiService
  ) {
    this.route.params.subscribe(params => {
      this.resourceId = params['resource'];
      this.loadResource();
    });
  }

  ngOnInit() {
  }

  loadResource() {
    this.api.getResource(this.resourceId).subscribe(
      (resource) => {
        this.resource = resource;
        this.isDataLoaded = true;
      }
    );
  }

  goInstitution($event) {
    $event.preventDefault();
    console.log('Go to the resource search screen, filtered by Institution');
  }

  goOwner($event) {
    $event.preventDefault();
    console.log('Go to the resource search screen, filtered by Owner');
  }

  goResourceType($event) {
    $event.preventDefault();
    console.log('Go to the resource search screen, filtered by ResourceType');
  }

  goWebsite($event) {
    $event.preventDefault();
    location.href = this.resource.website;
  }

}
