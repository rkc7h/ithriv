import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionRedirectComponent } from './session-redirect.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SessionRedirectComponent', () => {
  let component: SessionRedirectComponent;
  let fixture: ComponentFixture<SessionRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SessionRedirectComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
