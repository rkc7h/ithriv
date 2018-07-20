import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { routerTransition } from '../shared/router.animations';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  @HostBinding('@routerTransition')
  title: string;
  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute
  ) {
    this.selectedTabIndex = (this.route.routeConfig.path === 'register') ? 1 : 0;
  }

  ngOnInit() {
  }
}
