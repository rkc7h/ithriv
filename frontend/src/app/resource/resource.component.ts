import {Component, Input, OnInit} from '@angular/core';
import {Resource} from '../resource';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {

  @Input('resource') resource: Resource;

  constructor() { }

  ngOnInit() {
  }

}
