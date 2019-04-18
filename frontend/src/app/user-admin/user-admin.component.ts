import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserDataSource } from '../user-data-source';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { MatPaginator, MatSort } from '@angular/material';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { merge } from 'rxjs/internal/observable/merge';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit, AfterViewInit {

  dataSource: UserDataSource;
  displayedColumns = ['display_name', 'role', 'email', 'institution'];
  default_page_size = 10;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(private api: ResourceApiService,
    private router: Router) { }

  ngOnInit() {
    this.dataSource = new UserDataSource(this.api);
    this.dataSource.loadUsers('', 'display_name', 'asc',
      0, this.default_page_size);
  }

  onRowClicked(row) {
    this.router.navigate(['admin/users', row['id']]);
  }

  openAdd() {
    this.router.navigate(['admin/new_user']);
    (<any>window).ga('send', 'event', {
      eventCategory: 'UserAdmin',
      eventLabel: 'NewUser',
      eventAction: 'Add',
      eventValue: 10
    });
  }

  ngAfterViewInit() {

    // server-side search
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadUsers();
        })
      )
      .subscribe();

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => this.loadUsers())
    ).subscribe();

  }

  loadUsers() {
    this.dataSource.loadUsers(this.input.nativeElement.value, this.sort.active, this.sort.direction,
      this.paginator.pageIndex, this.paginator.pageSize);
  }

}
