import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatStepperModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './AuthInterceptor';
import { AvailabilityComponent } from './availability/availability.component';
import { BrowseComponent } from './browse/browse.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryTileComponent } from './category-tile/category-tile.component';
import { CategoryComponent } from './category/category.component';
import { HeaderComponent } from './header/header.component';
import { ResourceApiService } from './resource-api.service';
import { ResourceFormComponent } from './resource-form/resource-form.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { ResourceSearchComponent } from './resource-search/resource-search.component';
import { ResourceTileComponent } from './resource-tile/resource-tile.component';
import { ResourceComponent } from './resource/resource.component';
import { SearchComponent } from './search/search.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { EditCategoryButtonComponent } from './edit-category-button/edit-category-button.component';
import { AddCategoryButtonComponent } from './add-category-button/add-category-button.component';
import { EditResourceButtonComponent } from './edit-resource-button/edit-resource-button.component';
import { AddResourceButtonComponent } from './add-resource-button/add-resource-button.component';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search/:query', component: SearchComponent, data: { title: 'Search' } },
  { path: 'search', component: SearchComponent, data: { title: 'Search' } },
  { path: 'browse', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'browse/:category', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'category/:category', component: CategoryComponent, data: { title: 'Category' } },
  { path: 'category_form/:category', component: CategoryFormComponent, data: { title: 'Category Form' } },
  { path: 'resource/:resource', component: ResourceComponent, data: { title: 'Resource' } },
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
    CategoryFormComponent,
    ResourceFormComponent,
    HeaderComponent,
    CategoryTileComponent,
    ResourceTileComponent,
    FormFieldComponent,
    EditCategoryButtonComponent,
    AddCategoryButtonComponent,
    EditResourceButtonComponent,
    AddResourceButtonComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FlexLayoutModule,
    HttpClientModule,
    InfiniteScrollModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTabsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  entryComponents: [
    CategoryFormComponent, ResourceFormComponent
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
