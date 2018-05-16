import {Component, Input, OnInit} from '@angular/core';
import {Resource} from '../resource';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {

  @Input('resource')
  resource: Resource;

  constructor() { }

  ngOnInit() {
  }

}
