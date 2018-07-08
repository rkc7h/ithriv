import { Component, OnInit, Input } from '@angular/core';
import { Category } from '../category';
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-add-resource-button',
  templateUrl: './add-resource-button.component.html',
  styleUrls: ['./add-resource-button.component.scss']
})
export class AddResourceButtonComponent implements OnInit {
  @Input() category: Category;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openAdd() {
    this.router.navigateByUrl(`resource/add/${this.category.id}`);
  }
}
