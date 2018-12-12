import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { Category } from '../category';
import { getDummyCategory } from '../shared/fixtures/category';
import { MockMarkdownService } from '../shared/mocks/markdown.service.mock';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { HelpComponent } from './help.component';
import { By } from '@angular/platform-browser';

describe('HelpComponent', () => {
  let api: MockResourceApiService;
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [HelpComponent],
        imports: [
          MarkdownModule,
          MatIconModule,
          RouterTestingModule.withRoutes([])
        ],
        providers: [
          { provide: ResourceApiService, useValue: api },
          { provide: MarkdownService, useClass: MockMarkdownService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        const level2: Category = getDummyCategory();
        const level1: Category = level2.parent;
        const level0: Category = level1.parent;
        level0.children = [level1];
        level1.children = [level2];
        api.spyAndReturnFake('getCategories', [level0]);
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list categories', () => {
    const categoryEls = fixture.debugElement.queryAll(By.css('#site-map li'));
    expect(categoryEls.length).toBeGreaterThan(0);
  });

  it('should link to category details', () => {
    const level0 = fixture.debugElement.queryAll(By.css('#site-map a.level0'));
    expect(level0.length).toBeGreaterThan(0);

    const level1 = fixture.debugElement.queryAll(By.css('#site-map a.level1'));
    expect(level1.length).toBeGreaterThan(0);

    const level2 = fixture.debugElement.queryAll(By.css('#site-map a.level2'));
    expect(level2.length).toBeGreaterThan(0);
  });

  it('should link to a PDF of the site map', () => {
    const linkEls = fixture.debugElement.queryAll(By.css('#site-map .pdf-link'));
    expect(linkEls.length).toBeGreaterThan(0);
  });
});
