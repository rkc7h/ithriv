import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Resource } from '../resource';

@Component({
  selector: 'app-resource-tile',
  templateUrl: './resource-tile.component.html',
  styleUrls: ['./resource-tile.component.scss']
})
export class ResourceTileComponent implements OnInit {
  @Input() resource: Resource;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goResource($event, resource) {
    $event.preventDefault();
    this.router.navigate(['resource', resource.id]);
  }
}
