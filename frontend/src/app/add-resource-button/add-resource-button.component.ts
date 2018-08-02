import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";

@Component({
  selector: 'app-add-resource-button',
  templateUrl: './add-resource-button.component.html',
  styleUrls: ['./add-resource-button.component.scss']
})
export class AddResourceButtonComponent implements OnInit {
  @Input() category: Category;

  constructor(
    private router: Router,
    private api: ResourceApiService
  ) { }

  ngOnInit() {
  }

  openAdd() {
    this.router.navigateByUrl(`resource/add/${this.category.id}`);
  }

  getSession() {
    return this.api.session;
  }

}
