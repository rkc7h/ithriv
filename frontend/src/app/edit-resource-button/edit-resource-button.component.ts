import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import { Resource } from '../resource';
import { User } from "../user";
import { ResourceApiService } from "../shared/resource-api/resource-api.service";

@Component({
  selector: 'app-edit-resource-button',
  templateUrl: './edit-resource-button.component.html',
  styleUrls: ['./edit-resource-button.component.scss']
})
export class EditResourceButtonComponent implements OnInit {
  @Input() resource: Resource;
  @Input() category: Category;
  session: User;

  constructor(
    private router: Router,
    private api: ResourceApiService,
) { }

  ngOnInit() {
    this.api.getSession().subscribe(user => {
      this.session = user;
    });
  }

  openEdit() {
    this.router.navigateByUrl(`resource/${this.resource.id}/edit`);
  }

}
