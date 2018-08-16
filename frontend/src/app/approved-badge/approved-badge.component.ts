import { Component, OnInit, Input } from '@angular/core';
import { Resource } from '../resource';

@Component({
  selector: 'app-approved-badge',
  templateUrl: './approved-badge.component.html',
  styleUrls: ['./approved-badge.component.scss']
})
export class ApprovedBadgeComponent implements OnInit {
  @Input() resource: Resource;

  constructor() { }

  ngOnInit() {
  }
}
