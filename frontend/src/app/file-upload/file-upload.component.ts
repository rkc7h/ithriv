import { Component, Input, OnInit } from '@angular/core';
import { FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';
import { ReplaySubject } from 'rxjs';
import { FormField } from '../form-field';
import { zoomTransition } from '../shared/animations';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [zoomTransition()]
})
export class FileUploadComponent implements OnInit {
  @Input() field: FormField;
  updateFilesSubject = new ReplaySubject<File[]>();
  displayedColumns: string[] = ['name', 'type', 'size', 'lastModifiedDate', 'actions'];
  dropZoneHover = false;

  constructor() {
  }

  ngOnInit() {
    if (this.field && this.field.files && (this.field.files.length > 0)) {
      this.updateFileList();
    }

    this.field.formControl.valueChanges.subscribe(() => {
      this.updateFileList();
    });
  }

  dropped($event: UploadEvent) {
    this.dropZoneHover = false;

    $event.files.forEach((droppedFile, i) => {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          if (this.field.files.filter(f => f.name === file.name).length === 0) {
            this.field.files.push(file);
          }

          // When we're done looping through the files, update UI
          if (i === $event.files.length - 1) {
            this.updateFileList();
          }
        });
      }
    });
  }

  fileOver($event) {
    this.dropZoneHover = true;
  }

  fileLeave($event) {
    this.dropZoneHover = false;
  }

  formatSize(bytes: number, decimalPlaces = 2): string {
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    const factor = Math.pow(10, decimalPlaces);

    for (let i = 0; i < sizes.length; i++) {
      const divisor = Math.pow(10, (3 * (i + 1)));
      const nextDivisor = Math.pow(10, (3 * (i + 2)));

      if (bytes < nextDivisor) {
        return `${Math.round(bytes / divisor * factor) / factor} ${sizes[i]}`;
      }
    }
  }

  formatDate(d: Date): string {
    return `
      ${d.getFullYear()}/${d.getMonth()}/${d.getDay()}
      ${d.getHours()}:${d.getMinutes()}
    `;
  }

  truncate(s: string, maxLength = 20): string {
    if (s.length > (maxLength - 3)) {
      return s.slice(0, maxLength) + '...';
    } else {
      return s;
    }
  }

  fileIcon(file: File): string {
    const s = file.type || file.name;
    const nameArray = s.toLowerCase().split(file.type ? '/' : '.');

    if (nameArray.length > 0) {
      return `/assets/filetypes/${nameArray[nameArray.length - 1]}.svg`;
    } else {
      return `/assets/filetypes/unknown.svg`;
    }
  }

  removeFile(file: File) {
    this.field.files = this.field.files.filter(f => file.name !== f.name);
    this.updateFilesSubject.next(this.field.files);
  }

  updateFileList() {
    this.updateFilesSubject.next(this.field.files);
  }
}
