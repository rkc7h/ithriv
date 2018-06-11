import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  form: FormGroup;

  constructor(private router: Router) {
    this.form = new FormGroup({
      search: new FormControl()
    });
  }


  ngOnInit() {
  }

  goSearch(query) {
    this.router.navigate(['search', query]);
  }

  goBrowse() {
    this.router.navigate(['browse']);
  }

}
