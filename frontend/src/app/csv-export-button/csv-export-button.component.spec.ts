import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvExportButtonComponent } from './csv-export-button.component';

describe('CsvExportButtonComponent', () => {
  let component: CsvExportButtonComponent;
  let fixture: ComponentFixture<CsvExportButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsvExportButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvExportButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
