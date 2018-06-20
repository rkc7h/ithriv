import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Resource } from '../resource';

@Component({
  selector: 'app-resource-list',
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss']
})
export class ResourceListComponent implements OnInit {

  @Input() resources: Resource[];

  constructor() { }

  ngOnInit() {
  }

}
