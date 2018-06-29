import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { MatToolbarModule, MatIconModule, MatDividerModule, MatSlideToggleModule, MatButtonModule } from '@angular/material';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          MatButtonModule,
          MatDividerModule,
          MatIconModule,
          MatSlideToggleModule,
          MatToolbarModule,
        ],
        declarations: [HeaderComponent],
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in an h1 tag', async(() => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Research Concierge Portal');
  }));

});
