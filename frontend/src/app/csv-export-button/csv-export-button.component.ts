import { Component } from '@angular/core';
import { Angular2CsvComponent } from 'angular2-csv';

@Component({
  selector: 'app-csv-export-button',
  templateUrl: './csv-export-button.component.html',
  styleUrls: ['./csv-export-button.component.css']
})
export class CsvExportButtonComponent extends Angular2CsvComponent {

}
