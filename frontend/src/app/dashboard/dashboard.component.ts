import { Component, OnInit } from '@angular/core';
import { Category } from "../category";
import {ResourceApiService} from "../shared/resource-api/resource-api.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  categories: Category[];

  constructor(
    private api: ResourceApiService,
    ) {

    this.categories = [];

    this.api.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
      }
    );
  }

  ngOnInit() {
  }

}
