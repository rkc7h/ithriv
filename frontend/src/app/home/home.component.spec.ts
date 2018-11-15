import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ResourceListComponent } from '../resource-list/resource-list.component';
import { MatSidenavModule, MatExpansionModule, MatListModule, MatIconModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { CategoryTileComponent } from '../category-tile/category-tile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';



describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        ResourceListComponent,
        CategoryTileComponent
      ],
      imports: [
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        ReactiveFormsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
