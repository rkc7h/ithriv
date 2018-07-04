import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule, MatIconModule, MatDividerModule, MatToolbarModule, MatButtonToggleModule } from '@angular/material';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { MockResourceApiService } from './shared/resource-api/mocks/resource-api.service.mock';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockResourceApiService: MockResourceApiService;

  beforeEach(async(() => {
    mockResourceApiService = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        imports: [
          MatButtonModule,
          MatIconModule,
          MatDividerModule,
          MatToolbarModule,
          MatButtonToggleModule,
        ],
        declarations: [
          AppComponent,
          HeaderComponent,
          RouterOutlet
        ],
        providers: [
          {
            provide: ResourceApiService,
            useValue: mockResourceApiService
          }
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it(`should have as title 'iThriv'`, async(() => {
    expect(component.title).toEqual('iThriv');
  }));

  it('should load icons', async(() => {
    expect(component.icons).toBeTruthy();
  }));

});
