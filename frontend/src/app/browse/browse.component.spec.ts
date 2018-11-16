import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { MarkdownModule } from 'ngx-markdown';
import { GradientBackgroundDirective } from '../gradient-background.directive';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { MockScrollToService } from '../shared/mocks/scroll-to.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { BrowseComponent } from './browse.component';

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          BrowseComponent,
          GradientBackgroundDirective
        ],
        imports: [
          BrowserAnimationsModule,
          MarkdownModule,
          RouterTestingModule.withRoutes([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: ResourceApiService, useClass: MockResourceApiService },
          { provide: ScrollToService, useClass: MockScrollToService },
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BrowseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
