import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title = 'app';
  isHome = false;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.isHome = ['/', '/search'].includes(val.url);
      }
    });
  }

  ngOnInit() {
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

}
