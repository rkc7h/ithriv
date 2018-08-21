import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginServicesComponent } from './login-services.component';

describe('LoginServicesComponent', () => {
  let component: LoginServicesComponent;
  let fixture: ComponentFixture<LoginServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
