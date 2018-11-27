import { Component, HostBinding, OnInit } from '@angular/core';
import { fadeTransition } from '../shared/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeTransition()]
})
export class LoginComponent implements OnInit {
  @HostBinding('@fadeTransition')
  title: string;

  constructor() { }

  ngOnInit() { }
}
