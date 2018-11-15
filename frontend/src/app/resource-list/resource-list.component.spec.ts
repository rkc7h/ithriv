import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceListComponent } from './resource-list.component';
import { ResourceTileComponent } from '../resource-tile/resource-tile.component';
import { FormsModule } from '@angular/forms';

describe('ResourceListComponent', () => {
  let component: ResourceListComponent;
  let fixture: ComponentFixture<ResourceListComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [
          ResourceListComponent,
          ResourceTileComponent
        ],
        imports: [
          FormsModule
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
