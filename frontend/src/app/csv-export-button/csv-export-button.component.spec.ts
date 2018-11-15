import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvExportButtonComponent } from './csv-export-button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CsvExportButtonComponent', () => {
  let component: CsvExportButtonComponent;
  let fixture: ComponentFixture<CsvExportButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CsvExportButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
