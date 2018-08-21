import { Component, OnInit } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemDirectoryEntry, FileSystemFileEntry, FileSystemEntry } from 'ngx-file-drop';
import { zoomTransition } from '../shared/animations';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [zoomTransition()]
})
export class FileUploadComponent implements OnInit {
  files: UploadFile[] = [];
  fileEntries: FileSystemEntry[] = [];
  fileBlobs: File[] = [];
  dataSource: File[] = [];
  displayedColumns: string[] = ['name', 'type', 'size', 'lastModifiedDate'];
  dropZoneHover = false;

  constructor() { }

  ngOnInit() {
  }

  dropped($event: UploadEvent) {
    this.dataSource = [];
    this.files = $event.files;

    for (const droppedFile of $event.files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        this.fileEntries.push(fileEntry);

        fileEntry.file((file: File) => {
          if (this.fileBlobs.filter(f => f.name === file.name).length === 0) {
            this.fileBlobs.push(file);
          }

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/


          this.dataSource = this.fileBlobs;
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
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
}
