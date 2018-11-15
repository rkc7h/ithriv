import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule, MatIconModule, MatDividerModule, MatToolbarModule, MatButtonToggleModule } from '@angular/material';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { MockResourceApiService } from './shared/resource-api/mocks/resource-api.service.mock';
import { AppPage } from './app.po';

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

  it(`should have as title 'iTHRIV'`, async(() => {
    expect(component.title).toEqual('iTHRIV');
  }));

  it('should load icons', async(() => {
    expect(component.icons).toBeTruthy();
  }));

});
