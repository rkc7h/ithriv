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
import { CovalentTextEditorModule } from '@covalent/text-editor';
import { ColorPickerModule } from 'ngx-color-picker';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MarkdownModule } from 'ngx-markdown';
import { AddCategoryButtonComponent } from './add-category-button/add-category-button.component';
import { AddResourceButtonComponent } from './add-resource-button/add-resource-button.component';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './AuthInterceptor';
import { AvailabilityComponent } from './availability/availability.component';
import { BrowseComponent } from './browse/browse.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryTileComponent } from './category-tile/category-tile.component';
import { CategoryComponent } from './category/category.component';
import { EditCategoryButtonComponent } from './edit-category-button/edit-category-button.component';
import { EditResourceButtonComponent } from './edit-resource-button/edit-resource-button.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { HeaderComponent } from './header/header.component';
import { ResourceFormComponent } from './resource-form/resource-form.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { ResourceSearchComponent } from './resource-search/resource-search.component';
import { ResourceTileComponent } from './resource-tile/resource-tile.component';
import { ResourceComponent } from './resource/resource.component';
import { SearchComponent } from './search/search.component';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { GradientBackgroundDirective } from './gradient-background.directive';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { FormFieldLabelComponent } from './form-field-label/form-field-label.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AppRoutingModule } from './app-routing/app-routing.module';

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
    AddResourceButtonComponent,
    GradientBackgroundDirective,
    FormFieldLabelComponent,
    NotFoundComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ColorPickerModule,
    CommonModule,
    CovalentTextEditorModule,
    DeviceDetectorModule.forRoot(),
    FlexLayoutModule,
    HttpClientModule,
    InfiniteScrollModule,
    MarkdownModule.forRoot(),
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
    ReactiveFormsModule
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
