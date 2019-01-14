import { Component, HostBinding, OnInit } from '@angular/core';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { Institution } from '../institution';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timedout',
  templateUrl: './timedout.component.html',
  styleUrls: ['./timedout.component.scss'],
  animations: [fadeTransition()]
})
export class TimedoutComponent implements OnInit {
  @HostBinding('@fadeTransition')
  title: string;
  institution: Institution;

  constructor(
    private api: ResourceApiService,
    private router: Router
  ) {
    const institutionIdStr = sessionStorage.getItem('institution_id');

    if (institutionIdStr) {
      const institutionId = parseInt(institutionIdStr, 10);

      if (isFinite(institutionId)) {
        this.api
          .getInstitution(institutionId)
          .subscribe(institution => this.institution = institution);
      }
    }
  }

  ngOnInit() { }

  goHome() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['']);
  }
}
