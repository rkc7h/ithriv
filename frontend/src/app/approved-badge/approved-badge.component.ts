import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../resource';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-approved-badge',
  templateUrl: './approved-badge.component.html',
  styleUrls: ['./approved-badge.component.scss']
})
export class ApprovedBadgeComponent implements OnInit {
  @Input() resource: Resource;

  constructor(
    private api: ResourceApiService
  ) { }

  ngOnInit() {
  }

  handleClick($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.resource.approved === 'Approved') {
      this.resource.approved = 'Unapproved';
      this.api.updateResource(this.resource).subscribe(r => {
        this.resource = r;
      });
    } else {
      this.resource.approved = 'Approved';
      this.api.updateResource(this.resource).subscribe(r => {
        this.resource = r;
      });
    }
  }

  instructions(): string {
    const what = (this.resource.approved === 'Approved') ? 'Unapproved' : 'Approved';
    return `
      Mark this resource as ${what}.
      Unapproved resources are only visible to the resource owners and system
      administrators. Once a resource page is approved, it appears to users in the
      system. Edits to an approved resource immediately update the live content. A
      system administrator can return an approved resource to unapproved if needed
      while changes are underway.
    `;
  }
}
