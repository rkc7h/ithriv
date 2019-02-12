import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Category } from '../category';
import { fadeTransition } from '../shared/animations';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { User } from '../user';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  animations: [fadeTransition()],
})
export class BrowseComponent implements OnInit {
  @HostBinding('@fadeTransition')
  category: Category;
  user: User;
  allCategories: Category[];
  categoryId = 1;
  isDataLoaded = false;
  scrolling = false;
  breakpoint: string;
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
    private titleService: Title,
    private scrollToService: ScrollToService,
    public breakpointObserver: BreakpointObserver
  ) {

    this.route.params.subscribe(params => {
      if (params && params.hasOwnProperty('category')) {
        this.categoryId = params['category'];
        this.loadCategory(this.categoryId);
      }
      this.api.getSession().subscribe(user => this.user = user);
      this.loadAllCategories();
    });
  }

  scrollToRouteCategory() {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams && queryParams.hasOwnProperty('scrollTo')) {
        const config: ScrollToConfigOptions = {
          target: `category_${queryParams['scrollTo']}`
        };

        this.scrollToService.scrollTo(config).subscribe();
      }
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

  loadAllCategories() {
    this.api.getCategories().subscribe(cats => {
      this.allCategories = cats;
      this.isDataLoaded = true;
      this.scrollToRouteCategory();
    });
  }

  categoryRoute(category: Category) {
    if (category.level === 2) {
      return ['/category', category.id];
    } else if (this.api.getViewPreferences().isNetworkView) {
      return ['/network', category.id];
    } else {
      const id = (category.level === 1) ? category.parent_id : category.id;
      return ['/browse', id];
    }
  }

  updateCategory(category: Category) {
    if (category.level === 0) {
      this.loadAllCategories();
    } else {
      this.loadCategory(this.categoryId);
    }

    const config: ScrollToConfigOptions = {
      target: `category_${category.id}`
    };

    // Only one scrolling action at a time
    if (!this.scrolling) {
      this.scrolling = true;
      this.scrollToService.scrollTo(config).subscribe(result => {
        this.scrolling = false;
      });
    }
  }

  addCategory(category) {
    // This is very lazy, we could replace the category in place.
    this.isDataLoaded = false;
    this.loadCategory(this.categoryId);
  }


  ngOnInit() {
    this.breakpointObserver
      .observe([
        Breakpoints.XLarge,
        Breakpoints.Large,
        Breakpoints.Medium,
        Breakpoints.Small,
        Breakpoints.XSmall
      ])
      .subscribe((state: BreakpointState) => {
        if (state.breakpoints[Breakpoints.XLarge]) { this.breakpoint = 'xl'; }
        if (state.breakpoints[Breakpoints.Large]) { this.breakpoint = 'lg'; }
        if (state.breakpoints[Breakpoints.Medium]) { this.breakpoint = 'md'; }
        if (state.breakpoints[Breakpoints.Small]) { this.breakpoint = 'sm'; }
        if (state.breakpoints[Breakpoints.XSmall]) { this.breakpoint = 'xs'; }
      });
  }

  headerImage(category) {
    return `url('assets/browse/${category.image}')`;
  }

  headerGradient() {
    return `linear-gradient(to right, ${this.category.color}FF, ${this.category.color}FF 50%, ${this.category.color}00 75%)`;
  }

  categoryIcon(c: Category) {
    if (c.icon) {
      return `ithriv_${c.icon_id}`;
    }
  }

  gerunding(word: string) {
    return (
      word[0].toUpperCase() +
      word.slice(1)
        .toLowerCase()
        .replace(/e$/, '') + 'ing'
    );
  }

  hasCategories(): boolean {
    return (
      this.category &&
      this.allCategories &&
      (this.allCategories.length > 0)
    );
  }

  // Returns all Level 0 categories before the selected category
  prevCategories() {
    const cats: Category[] = [];

    if (this.hasCategories()) {
      for (const c of this.allCategories) {
        if (c.id === this.category.id) {
          return cats;
        } else {
          cats.push(c);
        }
      }
    } else {
      return cats;
    }
  }

  // Returns all Level 0 categories after the selected category
  nextCategories() {
    const cats: Category[] = [];

    if (this.hasCategories()) {
      const allCatsReversed = this.allCategories.slice().reverse();

      for (const c of allCatsReversed) {
        if (c.id === this.category.id) {
          return cats;
        } else {
          cats.unshift(c);
        }
      }
    }
  }

  getSiblings(cat: Category) {
    if (cat.level === 0) {
      return this.allCategories;
    } else if (cat.level === 1) {
      for (const parent of this.allCategories) {
        if (parent.id === cat.parent_id) {
          return parent;
        }
      }
    }
  }

  showMoveButtons() {
    return ['xl', 'lg', 'md'].includes(this.breakpoint);
  }
}
