import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseComponent } from '../browse/browse.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryComponent } from '../category/category.component';
import { ConsultRequestFormComponent } from '../consult-request-form/consult-request-form.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { GraphComponent } from '../network/graph/graph.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ProfileComponent } from '../profile/profile.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ResourceFormComponent } from '../resource-form/resource-form.component';
import { ResourceComponent } from '../resource/resource.component';
import { SearchComponent } from '../search/search.component';
import { SessionRedirectComponent } from '../session-redirect/session-redirect.component';
import { UserAdminComponent } from '../user-admin/user-admin.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'admin/new_user', component: ProfileComponent, data: { title: 'Edit your iTHRIV profile' } },
  { path: 'admin/users', component: UserAdminComponent, data: { title: 'User Administration' } },
  { path: 'admin/users/:id', component: ProfileComponent, data: { title: 'User Administration - Edit User' } },
  { path: 'browse', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'browse/:category', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'category_form/:category', component: CategoryFormComponent, data: { title: 'Category Form' } },
  { path: 'category/:category', component: CategoryComponent, data: { title: 'Category' } },
  { path: 'consult_request', component: ConsultRequestFormComponent, data: { title: 'Request a Consult', hideHeader: true } },
  { path: 'forgot_password', component: ForgotPasswordComponent, data: { title: 'Reset your iTHRIV password', hideHeader: true } },
  { path: 'home', component: HomeComponent, data: { title: 'Welcome to iTHRIV' } },
  { path: 'login', component: LoginComponent, data: { title: 'Log in to iTHRIV', hideHeader: true } },
  { path: 'login/:email_token', component: LoginComponent, data: { title: 'Log in to iTHRIV', hideHeader: true } },
  { path: 'network', component: GraphComponent, data: { title: 'Category' } },
  { path: 'network/:category', component: GraphComponent, data: { title: 'Category' } },
  { path: 'profile', component: ProfileComponent, data: { title: 'Edit your iTHRIV profile' } },
  { path: 'register', component: LoginComponent, data: { title: 'Sign up for iTHRIV', hideHeader: true } },
  {
    path: 'reset_password/:email_token', component: ResetPasswordComponent,
    data: { title: 'Reset your iTHRIV password', hideHeader: true }
  },
  { path: 'resource/:resource', component: ResourceComponent, data: { title: 'Resource' } },
  { path: 'resource/:resource/edit', component: ResourceFormComponent, data: { title: 'Edit Resource' } },
  { path: 'resource/add/:category', component: ResourceFormComponent, data: { title: 'Add Resource' } },
  { path: 'search', component: SearchComponent, data: { title: 'Search' } },
  { path: 'search/:query', component: SearchComponent, data: { title: 'Search' } },
  { path: 'search/filter/:field/:value', component: SearchComponent, data: { title: 'Search' } },
  { path: 'session/:token', component: SessionRedirectComponent, data: { title: 'Logging in...' } },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
