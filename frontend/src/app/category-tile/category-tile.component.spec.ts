import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GradientBorderDirective } from '../gradient-border.directive';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { CategoryTileComponent } from './category-tile.component';
import { Category } from '../category';
import { getDummyCategory } from '../shared/fixtures/category';

describe('CategoryTileComponent', () => {
  let component: CategoryTileComponent;
  let fixture: ComponentFixture<CategoryTileComponent>;
  const category: Category = getDummyCategory();

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          CategoryTileComponent,
          GradientBorderDirective
        ],
        imports: [
          BrowserAnimationsModule,
          MatTooltipModule,
          RouterTestingModule.withRoutes([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [{ provide: ResourceApiService, useClass: MockResourceApiService }]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CategoryTileComponent);
        component = fixture.componentInstance;
        component.category = category;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
