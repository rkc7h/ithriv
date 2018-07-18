import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../category';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { routerTransition } from '../shared/router.animations';
import { Title } from '../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  animations: [routerTransition()],
})
export class BrowseComponent implements OnInit {
  @HostBinding('@routerTransition')
  category: Category;
  categoryId = 1;
  isDataLoaded = false;
  dummyText = {
    category: `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
      irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur.
    `,
    c: `
      This should be a brief statement about the nature of the section and the resources
      users can find within it. It should briefly describe the contents of this section
      and give an overview of the resources that will be within it.
    `,
    sc: `
      The dummy text is a page description on the next page that establishes the content
      of the definitions and glossary category.
    `,
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ResourceApiService,
    private titleService: Title
  ) {

    this.route.params.subscribe(params => {
      this.categoryId = params['category'];
      this.loadCategory(this.categoryId);
    });
  }

  goBrowse($event, category) {
    $event.preventDefault();
    this.loadCategory(category);
  }

  loadCategory(categoryId: Number) {
    this.api.getCategory(categoryId).subscribe(
      (category) => {
        this.category = category;
        this.isDataLoaded = true;

        // Set page title
        const currentTitle = this.titleService.getTitle();
        this.titleService.setTitle(`${currentTitle} - ${this.category.name}`);
      }
    );
  }

  goCategory($event, category) {
    $event.preventDefault();
    this.router.navigate(['category', category]);
  }

  ngOnInit() {
  }

  headerImage() {
    return `url('assets/browse/${this.category.image}')`;
  }

  headerGradient() {
    return `linear-gradient(to right, ${this.category.color}FF, ${this.category.color}FF 50%, ${this.category.color}00 75%)`;
  }

  categoryIcon(c) {
    if (c.icon) {
      return `ithriv_${c.icon.id}`;
    }
  }

}
