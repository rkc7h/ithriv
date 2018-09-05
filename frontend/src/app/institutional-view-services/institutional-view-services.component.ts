import { Component, OnInit } from '@angular/core';
import { ResourceApiService } from "../shared/resource-api/resource-api.service";
import { LoginService } from '../login-service';

@Component({
  selector: 'app-institutional-view-services',
  templateUrl: './institutional-view-services.component.html',
  styleUrls: ['./institutional-view-services.component.scss']
})
export class InstitutionalViewServicesComponent implements OnInit {
  loginServices: LoginService[] = [];

  constructor(
    private api: ResourceApiService,
    ) {
    this.loadServices();
  }

  ngOnInit() {
  }

  loadServices() {
    const services = [];
    this.api.getInstitutions().subscribe(institutions => {
              for (const id in institutions) {
                if (institutions.hasOwnProperty(id)) {
                  const inst = institutions[id];
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
