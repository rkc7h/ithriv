import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { CategoryColorBorderDirective } from '../category-color-border.directive';
import { ResourceTileComponent } from '../resource-tile/resource-tile.component';
import { MockMarkdownService } from '../shared/mocks/markdown.service.mock';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { ResourceListComponent } from './resource-list.component';

describe('ResourceListComponent', () => {
  let api: MockResourceApiService;
  let component: ResourceListComponent;
  let fixture: ComponentFixture<ResourceListComponent>;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        declarations: [
          ResourceListComponent,
          ResourceTileComponent,
          CategoryColorBorderDirective
        ],
        imports: [
          FormsModule,
          MarkdownModule,
          MatTooltipModule
        ],
        providers: [
          { provide: ResourceApiService, useValue: api },
          { provide: MarkdownService, useClass: MockMarkdownService },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ResourceListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
