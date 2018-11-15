import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatIconModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { AddResourceButtonComponent } from './add-resource-button.component';
import { MockResourceApiService } from '../shared/resource-api/mocks/resource-api.service.mock'
import { ResourceApiService } from '../shared/resource-api/resource-api.service';

describe('AddResourceButtonComponent', () => {
  let component: AddResourceButtonComponent;
  let fixture: ComponentFixture<AddResourceButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddResourceButtonComponent],
      imports: [
        MatDialogModule,
        MatIconModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [{ provide: ResourceApiService, useClass: MockResourceApiService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResourceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
