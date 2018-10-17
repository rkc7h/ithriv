import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceCategory } from '../resource-category';
import { zoomTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { FileAttachment } from '../file-attachment';
import { ResourceType } from '../resourceType';

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

  getCategoryIcon(category: Category) {
    if (category.level === 2) {
      return `ithriv_${category.parent.icon.id}`;
    }
  }

  getAvailableInstitutions() {
    return this.resource
      .availabilities
      .filter(av => av.available)
      .map(av => av.institution);
  }

  goInstitution($event, institution: Institution) {
    $event.preventDefault();
    this.router.navigateByUrl(`/search/filter?Institution=${institution.name}`);
  }

  goCategory($event, category: Category) {
    $event.preventDefault();
    if (category.level === 0) {
      this.router.navigate(['browse', category.id]);
    } else if (category.level === 1) {
      this.router.navigate(['browse', category.parent.id], { queryParams: { scrollTo: category.id } });
    } else if (category.level === 2) {
      this.router.navigate(['category', category.id]);
    }
  }

  goResourceType($event, type: ResourceType) {
    $event.preventDefault();
    this.router.navigateByUrl(`/search/filter?Type=${type.name}`);
  }

  goWebsite($event) {
    $event.preventDefault();
    window.open(this.resource.website, '_blank');
  }

  openEdit() {
    this.router.navigateByUrl(`resource/${this.resource.id}/edit`);
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
