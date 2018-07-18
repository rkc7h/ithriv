import { Component, OnInit } from '@angular/core';
import { ActivationStart, Router, ActivationEnd } from '../../../node_modules/@angular/router';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title: string;

  constructor(
    private api: ResourceApiService
  ) {
  }

  ngOnInit() {
  }

}
