import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeBrowserComponent } from './upgrade-browser.component';

describe('UpgradeBrowserComponent', () => {
  let component: UpgradeBrowserComponent;
  let fixture: ComponentFixture<UpgradeBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
