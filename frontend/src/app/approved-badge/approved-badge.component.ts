import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../resource';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";

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

  getSession() {
    return this.api.session;
  }
}
