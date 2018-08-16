import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkViewNodeComponent } from './network-view-node.component';

describe('NetworkViewNodeComponent', () => {
  let component: NetworkViewNodeComponent;
  let fixture: ComponentFixture<NetworkViewNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkViewNodeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkViewNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
