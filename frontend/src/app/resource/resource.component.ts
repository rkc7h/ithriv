import {ActivatedRoute, Router} from '@angular/router';
import { Category } from '../category';
import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import { Institution } from '../institution';
import {ResourceCategory} from '../resource-category';

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
  @Input() categories: ResourceCategory[];

  isDataLoaded = false;

  constructor(
    private router: Router,
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
        this.loadResourceCategories();
      }
    );
  }

  loadResourceCategories() {
    this.api
      .getResourceCategories(this.resource)
      .subscribe(rcs => {
        console.log("Loaded Categories:" + rcs)
        this.categories = rcs;
        this.isDataLoaded = true;
      });
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

  goCategory($event, category: Category) {
    $event.preventDefault();
    this.router.navigate(['category', category.id])
    console.log('Go to the category page, filtered by Institution');
    console.log('category:', category);
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
    window.open(this.resource.website, '_blank');
  }

}
