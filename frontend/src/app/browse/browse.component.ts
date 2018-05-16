import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  category_name = 'Unknown';

  constructor(private router: Router,
              private route: ActivatedRoute) {
    this.route.params.subscribe( params =>
      this.category_name = params['category']);
  }

  ngOnInit() {
  }

  header_image() {
    return 'assets/browse/header-' + this.category_name + '.png';
  }


}
