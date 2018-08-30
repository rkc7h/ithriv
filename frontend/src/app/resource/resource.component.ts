import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceCategory } from '../resource-category';
import { zoomTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceAttachment } from '../resource-attachment';
import { FileAttachment } from '../file-attachment';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  animations: [zoomTransition()]
})
export class ResourceComponent implements OnInit {
  resourceId: number;
  @Input() resource: Resource;
  @Input() categories: ResourceCategory[];
  attachments: FileAttachment[];

  transitionState = '';
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
        this.loadResourceCategories(resource);
      }
    );
  }

  loadResourceCategories(resource: Resource) {
    this.api
      .getResourceCategories(resource)
      .subscribe(rcs => {
        console.log('Loaded Categories:', rcs);
        this.categories = rcs;
        this.transitionState = 'zoom-in-enter';
        this.isDataLoaded = true;
      });
  }

  loadResourceAttachments(resource: Resource) {
    this.attachments = resource.files;
    this.transitionState = 'zoom-in-enter';
    this.isDataLoaded = true;
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
    this.router.navigate(['category', category.id]);
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

  fileIcon(file: FileAttachment): string {
    const s = file.mime_type || file.type || file.name || file.file_name;
    const nameArray = s.toLowerCase().split((file.mime_type || file.type) ? '/' : '.');

    if (nameArray.length > 0) {
      return `/assets/filetypes/${nameArray[nameArray.length - 1]}.svg`;
    } else {
      return `/assets/filetypes/unknown.svg`;
    }
  }
}
