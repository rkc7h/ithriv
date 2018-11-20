import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as articles from './articles.json';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  privateArticles = [];
  publicArticles = [];
  breakpoint: string;

  constructor(
    private router: Router,
    public breakpointObserver: BreakpointObserver
  ) {
    this.privateArticles = articles.default.filter(a => !a.public);
    this.publicArticles = articles.default.filter(a => a.public);
  }

  ngOnInit() {
    this.breakpointObserver
      .observe([
        Breakpoints.XLarge,
        Breakpoints.Large,
        Breakpoints.Medium,
        Breakpoints.Small,
        Breakpoints.XSmall
      ])
      .subscribe((state: BreakpointState) => {
        if (state.breakpoints[Breakpoints.XLarge]) { this.breakpoint = 'xl'; }
        if (state.breakpoints[Breakpoints.Large]) { this.breakpoint = 'lg'; }
        if (state.breakpoints[Breakpoints.Medium]) { this.breakpoint = 'md'; }
        if (state.breakpoints[Breakpoints.Small]) { this.breakpoint = 'sm'; }
        if (state.breakpoints[Breakpoints.XSmall]) { this.breakpoint = 'xs'; }
      });
  }

  goConsult($event) {
    $event.preventDefault();
    this.router.navigate(['consult_request']);
  }

}
