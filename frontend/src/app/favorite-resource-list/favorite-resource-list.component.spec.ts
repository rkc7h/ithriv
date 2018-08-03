import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteResourceListComponent } from './favorite-resource-list.component';

describe('FavoriteResourceListComponent', () => {
  let component: FavoriteResourceListComponent;
  let fixture: ComponentFixture<FavoriteResourceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteResourceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
