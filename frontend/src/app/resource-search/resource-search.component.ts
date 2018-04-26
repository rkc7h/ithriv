import {Component, Input, OnInit} from '@angular/core';
import {Resource} from '../resource';

@Component({
  selector: 'app-resource-search',
  templateUrl: './resource-search.component.html',
  styleUrls: ['./resource-search.component.css']
})
export class ResourceSearchComponent implements OnInit {

  @Input('resource') resource: Resource;

  constructor() { }

  ngOnInit() {
  }

}
