import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseComponent } from '../browse/browse.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryNetworkViewComponent } from '../category-network-view/category-network-view.component';
import { CategoryComponent } from '../category/category.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ProfileComponent } from '../profile/profile.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ResourceFormComponent } from '../resource-form/resource-form.component';
import { ResourceComponent } from '../resource/resource.component';
import { SearchComponent } from '../search/search.component';
import { SessionRedirectComponent } from '../session-redirect/session-redirect.component';
import {UserAdminComponent} from '../user-admin/user-admin.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { title: 'Welcome to iThriv' } },
  { path: 'login', component: LoginComponent, data: { title: 'Log in to iThriv', hideHeader: true } },
  { path: 'login/:email_token', component: LoginComponent, data: { title: 'Log in to iThriv', hideHeader: true } },
  { path: 'register', component: LoginComponent, data: { title: 'Sign up for iThriv', hideHeader: true } },
  { path: 'forgot_password', component: ForgotPasswordComponent, data: { title: 'Reset your iThriv password', hideHeader: true } },
  { path: 'reset_password/:email_token', component: ResetPasswordComponent,
            data: { title: 'Reset your iThriv password', hideHeader: true } },
  { path: 'search/:query', component: SearchComponent, data: { title: 'Search' } },
  { path: 'search', component: SearchComponent, data: { title: 'Search' } },
  { path: 'browse', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'browse/:category', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'category/:category', component: CategoryComponent, data: { title: 'Category' } },
  { path: 'category/:category/network', component: CategoryNetworkViewComponent, data: { title: 'Category' } },
  { path: 'category_form/:category', component: CategoryFormComponent, data: { title: 'Category Form' } },
  { path: 'resource/:resource', component: ResourceComponent, data: { title: 'Resource' } },
  { path: 'resource/:resource/edit', component: ResourceFormComponent, data: { title: 'Edit Resource' } },
  { path: 'resource/add/:category', component: ResourceFormComponent, data: { title: 'Add Resource' } },
  { path: 'session/:token', component: SessionRedirectComponent, data: { title: 'Logging in...' } },
  { path: 'admin/users', component: UserAdminComponent, data: { title: 'User Administration' } },
  { path: 'admin/users/:id', component: ProfileComponent, data: { title: 'User Administration - Edit User' } },
  { path: 'admin/new_user', component: ProfileComponent, data: { title: 'Edit your iThriv profile' } },
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
