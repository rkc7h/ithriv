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
  institution: Institution;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService
  ) {
    this.selectedTabIndex = (this.route.routeConfig.path === 'register') ? 1 : 0;
    this.getInstitution();
  }

  ngOnInit() {
  }

  goHome($event) {
    $event.preventDefault();
    this.router.navigate(['']);
  }

  getInstitution() {
    this.api.getInstitution(parseInt(sessionStorage.getItem("institution_id"), 10)).subscribe(
      (inst) => {
        this.institution = inst;
      }
    );
    return this.institution;
  }
}
