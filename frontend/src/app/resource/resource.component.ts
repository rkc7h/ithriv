import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { Institution } from '../institution';
import { Resource } from '../resource';
import { ResourceCategory } from '../resource-category';
import { zoomTransition, fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { FileAttachment } from '../file-attachment';
import { ResourceType } from '../resourceType';
import { User } from '../user';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  animations: [zoomTransition(), fadeTransition()]
})
export class ResourceComponent implements OnInit {
  resourceId: number;
  @Input() resource: Resource;
  @Input() categories: ResourceCategory[];
  attachments: FileAttachment[];
  user: User;

  transitionState = '';

  @HostBinding('@fadeTransition')
  isDataLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService
  ) {
    this.route.params.subscribe(params => {
      this.resourceId = params['resource'];
      this.loadResource();
      this.loadUser();
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

  loadUser() {
    this.api.getSession().subscribe(user => this.user = user);
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

    if (category.level === 2) {
      this.router.navigate(['category', category.id]);
    } else if (this.api.getViewPreferences().isNetworkView) {
      this.router.navigate(['network', category.id]);
    } else {
      const id = (category.level === 1) ? category.parent.id : category.id;
      this.router.navigate(['browse', id]);
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

  togglePrivate(isPrivate: boolean) {
    this.resource.private = isPrivate;
    this.api.updateResource(this.resource).subscribe();
  }
}
