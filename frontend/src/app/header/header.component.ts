import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  title = 'app';

  constructor(private router: Router) { }

  ngOnInit() {
  }


  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.router.navigate(['browse', category]);
  }

  goSearch($event) {
    $event.preventDefault();
    this.router.navigate(['search']);
  }

}
