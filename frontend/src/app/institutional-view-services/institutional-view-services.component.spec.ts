import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionalViewServicesComponent } from './institutional-view-services.component';

describe('InstitutionalViewServicesComponent', () => {
  let component: InstitutionalViewServicesComponent;
  let fixture: ComponentFixture<InstitutionalViewServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstitutionalViewServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionalViewServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
