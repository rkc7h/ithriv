import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        declarations: [HelpComponent],
        imports: [
          MatIconModule,
          RouterTestingModule.withRoutes([])
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
