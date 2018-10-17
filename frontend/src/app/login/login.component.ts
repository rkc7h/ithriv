import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeTransition } from '../shared/animations';

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

  constructor() {
  }

  ngOnInit() {
  }
}
