import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedBadgeComponent } from './approved-badge.component';

describe('ApprovedBadgeComponent', () => {
  let component: ApprovedBadgeComponent;
  let fixture: ComponentFixture<ApprovedBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovedBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
