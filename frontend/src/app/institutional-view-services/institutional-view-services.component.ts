import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginService } from '../login-service';
import {ResourceApiService} from "../shared/resource-api/resource-api.service";
import {forEach} from "@angular/router/src/utils/collection";
import {Institution} from "../institution";

@Component({
  selector: 'app-institutional-view-services',
  templateUrl: './institutional-view-services.component.html',
  styleUrls: ['./institutional-view-services.component.scss']
})
export class InstitutionalViewServicesComponent implements OnInit {
  loginServices: LoginService[] = [];
  institutions: Institution[] = [];

  constructor(
    private api: ResourceApiService,
    ) {
    this.loadServices();
  }

  ngOnInit() {
  }

  // !!! TO DO: Load available login services from the API
  loadServices() {
    const services = [];
    this.api.getInstitutions().subscribe(institutions => {
              this.institutions = institutions;
              for (const id in this.institutions) {
                if (this.institutions.hasOwnProperty(id)) {
                  const inst = this.institutions[id];
                  if (inst.name != 'iTHRIV') {
                    const image = '/assets/institutions/' + inst.name + '.png';
                    services.push({ id:inst.id, name: inst.name, color: 'black', image: image });
                  }
                }
              }
              this.loginServices = services.map(s => new LoginService(s));
            });
  }

  setInstitutionService(loginService: LoginService) {
    sessionStorage.setItem('institution_id', loginService.id.toString());
    sessionStorage.setItem('institution_name', loginService.name);
  }

}
