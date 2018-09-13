import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from "../shared/resource-api/resource-api.service";
import { Institution } from "../institution";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeTransition()]
})
export class LoginComponent implements OnInit {
  @HostBinding('@fadeTransition')
  title: string;
  selectedTabIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.selectedTabIndex = (this.route.routeConfig.path === 'register') ? 1 : 0;
  }

  ngOnInit() {
  }
}
