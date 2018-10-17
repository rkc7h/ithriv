import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../category';
import { User } from '../user';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-add-resource-button',
  templateUrl: './add-resource-button.component.html',
  styleUrls: ['./add-resource-button.component.scss']
})
export class AddResourceButtonComponent implements OnInit {
  @Input() category: Category;
  session: User;

  constructor(
    private router: Router,
    private api: ResourceApiService,
  ) { }

  ngOnInit() {
    this.api.getSession().subscribe(user => {
      console.log({ user });
      this.session = user;
    });
  }

  openAdd() {
    this.router.navigateByUrl(`resource/add/${this.category.id}`);
  }
}
