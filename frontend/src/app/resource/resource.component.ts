import { ActivatedRoute } from '@angular/router';
import { Category } from '../category';
import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import { Institution } from '../institution';
import { Title } from '../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  animations: [routerTransition()]
})
export class ResourceComponent implements OnInit {
  @HostBinding('@routerTransition')
  resourceId: number;
  @Input() resource: Resource;
  @Input() categories: Category[];

  isDataLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private titleService: Title
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

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.resource.name}`);
      }
    );
  }

  loadCategory() {
    this.api.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
        this.isDataLoaded = true;
      }
    );
  }

  getAvailableInstitutions() {
    return this.resource
      .availabilities
      .filter(av => av.available)
      .map(av => av.institution);
  }

  goInstitution($event, institution: Institution) {
    $event.preventDefault();
    console.log('Go to the resource search screen, filtered by Institution');
    console.log('institution:', institution);
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
