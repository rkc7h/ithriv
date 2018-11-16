import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteResourceButtonComponent } from './favorite-resource-button.component';
import { MatTooltipModule } from '@angular/material';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { MockResourceApiService } from '../shared/mocks/resource-api.service.mock';

describe('FavoriteResourceButtonComponent', () => {
  let component: FavoriteResourceButtonComponent;
  let fixture: ComponentFixture<FavoriteResourceButtonComponent>;
  let api: MockResourceApiService;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed.configureTestingModule({
      declarations: [FavoriteResourceButtonComponent],
      imports: [
        MatTooltipModule
      ],
      providers: [
        { provide: ResourceApiService, useValue: api }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteResourceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
