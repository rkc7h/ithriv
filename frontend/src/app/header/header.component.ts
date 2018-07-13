import { Component, OnInit, HostBinding } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { routerTransition } from '../shared/router.animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [routerTransition()],
})
export class HeaderComponent implements OnInit {
  @HostBinding('@routerTransition')
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
