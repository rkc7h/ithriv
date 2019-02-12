import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatBadgeModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
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
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CovalentTextEditorModule } from '@covalent/text-editor';
import { NgProgressModule } from '@ngx-progressbar/core';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { Angular2CsvModule } from 'angular2-csv';
import { InlineSVGModule } from 'ng-inline-svg';
import { ColorPickerModule } from 'ngx-color-picker';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { FileDropModule } from 'ngx-file-drop';
import { MarkdownModule } from 'ngx-markdown';
import { AddCategoryButtonComponent } from './add-category-button/add-category-button.component';
import { AddResourceButtonComponent } from './add-resource-button/add-resource-button.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { ApprovedBadgeComponent } from './approved-badge/approved-badge.component';
import { AuthInterceptor } from './AuthInterceptor';
import { AvailabilityComponent } from './availability/availability.component';
import { BrowseComponent } from './browse/browse.component';
import { CategoryColorBorderDirective } from './category-color-border.directive';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CategoryTileComponent } from './category-tile/category-tile.component';
import { CategoryComponent } from './category/category.component';
import { ConsultRequestFormComponent } from './consult-request-form/consult-request-form.component';
import { CsvExportButtonComponent } from './csv-export-button/csv-export-button.component';
import { EditCategoryButtonComponent } from './edit-category-button/edit-category-button.component';
import { EditResourceButtonComponent } from './edit-resource-button/edit-resource-button.component';
import { FavoriteResourceButtonComponent } from './favorite-resource-button/favorite-resource-button.component';
import { FavoriteResourceListComponent } from './favorite-resource-list/favorite-resource-list.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormFieldLabelComponent } from './form-field-label/form-field-label.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { GradientBackgroundDirective } from './gradient-background.directive';
import { GradientBorderDirective } from './gradient-border.directive';
import { HomeComponent } from './home/home.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginServicesComponent } from './login-services/login-services.component';
import { LoginComponent } from './login/login.component';
import { LogoComponent } from './logo/logo.component';
import { GraphComponent } from './network/graph/graph.component';
import { NodeComponent } from './network/node/node.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResourceFormComponent } from './resource-form/resource-form.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { ResourceSearchComponent } from './resource-search/resource-search.component';
import { ResourceTileComponent } from './resource-tile/resource-tile.component';
import { ResourceComponent } from './resource/resource.component';
import { SearchComponent } from './search/search.component';
import { SessionRedirectComponent } from './session-redirect/session-redirect.component';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { UserAdminComponent } from './user-admin/user-admin.component';
import { UserResourceListComponent } from './user-resource-list/user-resource-list.component';
import { MoveCategoryButtonComponent } from './move-category-button/move-category-button.component';
import { HelpComponent } from './help/help.component';
import { LogoutComponent } from './logout/logout.component';
import { TimedoutComponent } from './timedout/timedout.component';
import { LoadingComponent } from './loading/loading.component';
import { IntervalService } from './shared/interval/interval.service';
import { TimeLeftPipe } from './shared/filters/time-left.pipe';
import { UpgradeBrowserComponent } from './upgrade-browser/upgrade-browser.component';

@NgModule({
  declarations: [
    AddCategoryButtonComponent,
    AddResourceButtonComponent,
    AppComponent,
    ApprovedBadgeComponent,
    AvailabilityComponent,
    BrowseComponent,
    CategoryColorBorderDirective,
    CategoryComponent,
    CategoryFormComponent,
    CategoryTileComponent,
    ConsultRequestFormComponent,
    CsvExportButtonComponent,
    EditCategoryButtonComponent,
    EditResourceButtonComponent,
    FavoriteResourceButtonComponent,
    FavoriteResourceListComponent,
    FileUploadComponent,
    ForgotPasswordComponent,
    FormFieldComponent,
    FormFieldLabelComponent,
    GradientBackgroundDirective,
    GradientBorderDirective,
    GraphComponent,
    HomeComponent,
    LoginComponent,
    LoginFormComponent,
    LoginServicesComponent,
    LogoComponent,
    MoveCategoryButtonComponent,
    NodeComponent,
    NotFoundComponent,
    ProfileComponent,
    RegisterFormComponent,
    ResetPasswordComponent,
    ResourceComponent,
    ResourceFormComponent,
    ResourceListComponent,
    ResourceSearchComponent,
    ResourceTileComponent,
    SearchComponent,
    SessionRedirectComponent,
    TreeSelectComponent,
    UserAdminComponent,
    UserResourceListComponent,
    HelpComponent,
    LogoutComponent,
    TimedoutComponent,
    LoadingComponent,
    TimeLeftPipe,
    UpgradeBrowserComponent
  ],
  imports: [
    Angular2CsvModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ColorPickerModule,
    CommonModule,
    CovalentTextEditorModule,
    DeviceDetectorModule.forRoot(),
    FileDropModule,
    FlexLayoutModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
    LayoutModule,
    MarkdownModule.forRoot(),
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    NgProgressModule.forRoot(),
    ReactiveFormsModule,
    ScrollToModule.forRoot()
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
    ResourceApiService,
    IntervalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
