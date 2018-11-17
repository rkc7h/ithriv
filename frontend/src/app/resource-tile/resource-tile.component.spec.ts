import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule } from 'ngx-markdown';
import { CategoryColorBorderDirective } from '../category-color-border.directive';
import { ResourceTileComponent } from './resource-tile.component';

describe('ResourceTileComponent', () => {
  let component: ResourceTileComponent;
  let fixture: ComponentFixture<ResourceTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ResourceTileComponent,
        CategoryColorBorderDirective
      ],
      imports: [
        MarkdownModule,
        MatTooltipModule,
        RouterTestingModule.withRoutes([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
