import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../resource';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";
import {resource} from "selenium-webdriver/http";

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
    if (this.resource.approved == "Approved") {
      this.resource.approved = "Unapproved";
      this.api.updateResource(this.resource).subscribe(r => {
        this.resource = r;
      });
    } else {
      this.resource.approved = "Approved";
      this.api.updateResource(this.resource).subscribe(r => {
        this.resource = r;
      });
    }
  }

  instructions(): string {
    if (this.resource.approved == "Approved") {
      return 'Mark this resource as Unapproved';
    } else {
      return 'Mark this resource as Approved';
    }
  }
}
