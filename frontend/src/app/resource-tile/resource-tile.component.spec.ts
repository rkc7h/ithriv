import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceTileComponent } from './resource-tile.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ResourceTileComponent', () => {
  let component: ResourceTileComponent;
  let fixture: ComponentFixture<ResourceTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResourceTileComponent],
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
