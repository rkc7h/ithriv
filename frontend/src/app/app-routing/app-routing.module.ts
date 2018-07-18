import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { BrowseComponent } from '../browse/browse.component';
import { CategoryComponent } from '../category/category.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { ResourceComponent } from '../resource/resource.component';
import { ResourceFormComponent } from '../resource-form/resource-form.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import {SessionRedirectComponent} from '../session-redirect/session-redirect.component';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search/:query', component: SearchComponent, data: { title: 'Search' } },
  { path: 'search', component: SearchComponent, data: { title: 'Search' } },
  { path: 'browse', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'browse/:category', component: BrowseComponent, data: { title: 'Browse' } },
  { path: 'category/:category', component: CategoryComponent, data: { title: 'Category' } },
  { path: 'category_form/:category', component: CategoryFormComponent, data: { title: 'Category Form' } },
  { path: 'resource/:resource', component: ResourceComponent, data: { title: 'Resource' } },
  { path: 'resource/:resource/edit', component: ResourceFormComponent, data: { title: 'Edit Resource' } },
  { path: 'resource/add/:category', component: ResourceFormComponent, data: { title: 'Add Resource' } },
  { path: 'session/:token', component: SessionRedirectComponent, data: { title: 'Logging in...' } },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
