import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryNetworkViewComponent } from './category-network-view.component';

describe('CategoryNetworkViewComponent', () => {
  let component: CategoryNetworkViewComponent;
  let fixture: ComponentFixture<CategoryNetworkViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryNetworkViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryNetworkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
