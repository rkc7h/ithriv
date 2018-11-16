import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatDividerModule,
  MatIconModule,
  MatToolbarModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MockResourceApiService } from './shared/mocks/resource-api.service.mock';
import { ResourceApiService } from './shared/resource-api/resource-api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Icon } from './icon';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: MockResourceApiService;

  beforeEach(async(() => {
    api = new MockResourceApiService();

    TestBed
      .configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          MatButtonModule,
          MatIconModule,
          MatDividerModule,
          MatToolbarModule,
          MatButtonToggleModule,
          RouterTestingModule.withRoutes([])
        ],
        declarations: [
          AppComponent
        ],
        providers: [
          { provide: ResourceApiService, useClass: MockResourceApiService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
    const icons: Icon[] = [
      { id: 0, name: 'jabba_the_hutt', url: 'some.website.com/icons/jabba' },
      { id: 1, name: 'boba_fett', url: 'some.website.com/icons/boba' },
      { id: 2, name: 'max_rebo', url: 'some.website.com/icons/max' },
    ];

    api.setResponse(icons);
    api.getIconsSpy(result => {
      expect(component.icons).toEqual(icons);
    });
  }));

});
