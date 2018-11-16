import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { FavoriteResourceListComponent } from './favorite-resource-list.component';

describe('FavoriteResourceListComponent', () => {
  let component: FavoriteResourceListComponent;
  let fixture: ComponentFixture<FavoriteResourceListComponent>;
  let api: MockResourceApiService;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [FavoriteResourceListComponent],
      providers: [
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
