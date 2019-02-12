import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { BrowseComponent } from '../browse/browse.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryComponent } from '../category/category.component';
import { ConsultRequestFormComponent } from '../consult-request-form/consult-request-form.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { HelpComponent } from '../help/help.component';
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
import { LogoutComponent } from '../logout/logout.component';
import { TimedoutComponent } from '../timedout/timedout.component';
import { UpgradeBrowserComponent } from '../upgrade-browser/upgrade-browser.component';

export function searchFilterMatcher(url: UrlSegment[]) {
  if (
    (url.length === 2) &&
    (url[0].path === ('search')) &&
    (url[1].path === ('filter'))
  ) {
    return { consumed: url };
  }
  return null;
}

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'admin/new_user', component: ProfileComponent, data: { title: 'Edit your iTHRIV profile' } },
  { path: 'admin/users', component: UserAdminComponent, data: { title: 'User Administration' } },
  { path: 'admin/users/:id', component: ProfileComponent, data: { title: 'User Administration - Edit User' } },
  { path: 'browse', component: BrowseComponent, data: { title: 'Find Resources' } },
  { path: 'browse/:category', component: BrowseComponent, data: { title: 'Find Resources' } },
  { path: 'category_form/:category', component: CategoryFormComponent, data: { title: 'Edit Category' } },
  { path: 'category/:category', component: CategoryComponent, data: { title: 'Find Resources' } },
  { path: 'consult_request', component: ConsultRequestFormComponent, data: { title: 'Request a Consult', hideHeader: true } },
  { path: 'forgot_password', component: ForgotPasswordComponent, data: { title: 'Reset your iTHRIV password', hideHeader: true } },
  { path: 'help', component: HelpComponent, data: { title: 'iTHRIV Help' } },
  { path: 'home', component: HomeComponent, data: { title: 'Find Health Research Resources' } },
  { path: 'login', component: LoginComponent, data: { title: 'Log in to iTHRIV', hideHeader: true } },
  { path: 'login/:email_token', component: LoginComponent, data: { title: 'Log in to iTHRIV', hideHeader: true } },
  { path: 'logout', component: LogoutComponent, data: { title: 'Logged out from iTHRIV', hideHeader: true } },
  { path: 'network', component: GraphComponent, data: { title: 'Find Resources' } },
  { path: 'network/:category', component: GraphComponent, data: { title: 'Find Resources' } },
  { path: 'profile', component: ProfileComponent, data: { title: 'Edit your iTHRIV profile' } },
  { path: 'register', component: LoginComponent, data: { title: 'Sign up for iTHRIV', hideHeader: true } },
  {
    path: 'reset_password/:email_token', component: ResetPasswordComponent,
    data: { title: 'Reset your iTHRIV password', hideHeader: true }
  },
  { path: 'resource/:resource', component: ResourceComponent, data: { title: 'Resource Details' } },
  { path: 'resource/:resource/edit', component: ResourceFormComponent, data: { title: 'Edit Resource' } },
  { path: 'resource/add/:category', component: ResourceFormComponent, data: { title: 'Add Resource' } },
  { path: 'search', component: SearchComponent, data: { title: 'Search Resources' } },
  { path: 'search/:query', component: SearchComponent, data: { title: 'Search Resources' } },
  { matcher: searchFilterMatcher, component: SearchComponent, data: { title: 'Search Resources' } },
  { path: 'session/:token', component: SessionRedirectComponent, data: { title: 'Logging in...', hideHeader: true } },
  { path: 'timedout', component: TimedoutComponent, data: { title: 'iTHRIV session timed out', hideHeader: true } },
  { path: 'upgrade_browser', component: UpgradeBrowserComponent, data: { title: 'Please upgrade your browser', hideHeader: true } },
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
