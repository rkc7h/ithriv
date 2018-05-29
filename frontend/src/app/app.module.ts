import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { ResourceSearchComponent } from './resource-search/resource-search.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './AuthInterceptor';
import { ResourceComponent } from './resource/resource.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import {RouterModule, Routes} from '@angular/router';
import {SearchComponent} from './search/search.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {
  MatButtonModule, MatIconModule, MatMenuModule, MatToolbarModule, MatCardModule,
  MatInputModule, MatCheckboxModule, MatFormFieldModule, MatTabsModule, MatProgressSpinnerModule,
  MatExpansionModule, MatSelectModule, MatListModule, MatRadioModule, MatStepperModule, MatSidenavModule,
  MatDialogModule, MatDatepickerModule, MatNativeDateModule, MatSnackBar, MatSnackBarModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import {ResourceApiService} from './resource-api.service';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AvailabilityComponent } from './availability/availability.component';
import { BrowseComponent } from './browse/browse.component';
import { CategoryComponent } from './category/category.component';
import { CategoryFormComponent } from './category-form/category-form.component';

const routes: Routes = [
  {path: '', redirectTo: 'search', pathMatch: 'full'},
  {path: 'search/:query', component: SearchComponent, data: {title: 'Search'}},
  {path: 'search', component: SearchComponent, data: {title: 'Search'}},
  {path: 'browse', component: BrowseComponent, data: {title: 'Browse'}},
  {path: 'browse/:category', component: BrowseComponent, data: {title: 'Browse'}},
  {path: 'category/:category', component: CategoryComponent, data: {title: 'Category'}},
  {path: 'category_form/:category', component: CategoryFormComponent, data: {title: 'Category Form'}},

  ];

@NgModule({
  declarations: [
    AppComponent,
    ResourceSearchComponent,
    ResourceComponent,
    ResourceListComponent,
    SearchComponent,
    AvailabilityComponent,
    BrowseComponent,
    CategoryComponent,
    CategoryFormComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, {useHash: true}),
    HttpClientModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    FlexLayoutModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatExpansionModule,
    MatListModule,
    MatRadioModule,
    MatStepperModule,
    MatSidenavModule,
    MatDialogModule,
    MatDatepickerModule
  ],
  entryComponents: [
    CategoryFormComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ResourceApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
