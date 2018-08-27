import { Component, Input, OnInit } from '@angular/core';
import { FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';
import { ReplaySubject } from 'rxjs';
import { FormField } from '../form-field';
import { zoomTransition } from '../shared/animations';
import { FileAttachment } from '../file-attachment';
import { ResourceApiService } from '../shared/resource-api/resource-api.service';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { ParallelHasher } from 'ts-md5/dist/parallel_hasher';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  animations: [zoomTransition()]
})
export class FileUploadComponent implements OnInit {
  @Input() field: FormField;
  updateFilesSubject = new ReplaySubject<Map<number | string, FileAttachment>>();
  displayedColumns: string[] = ['name', 'type', 'size', 'lastModifiedDate', 'actions'];
  dropZoneHover = false;
  progress: NgProgressComponent;

  constructor(private api: ResourceApiService) {
  }

  ngOnInit() {
    if (this.field && this.field.attachments && (this.field.attachments.size > 0)) {
      this.updateFileList();
    }

    this.field.formControl.valueChanges.subscribe(() => {
      this.updateFileList();
    });
  }

  dropped($event: UploadEvent) {
    this.dropZoneHover = false;

    $event.files.forEach((droppedFile, i) => {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file(newFile => this.addFile(newFile));
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

  addFile(attachment: FileAttachment) {

    // Check for existing attachments
    if (this.field.attachments.has(attachment.name)) {

      // Existing attachment. Copy all existing metadata to the new file.
      const old = this.field.attachments.get(attachment.name);
      attachment.id = old.id;
      attachment.display_name = old.display_name;
      attachment.status = 'updated';
      this.field.attachments.set(attachment.name, attachment);
    } else {

      // New attachment.
      attachment.status = 'added';
      this.field.attachments.set(attachment.name, attachment);
    }

    const hasher = new ParallelHasher('/assets/md5_worker.js');
    hasher.hash(attachment).then(md5 => {
      attachment.md5 = md5;

      // Upload changes to S3 immediately
      this.api.addFileAttachment(attachment).subscribe(fa => {
        console.log('fa', fa);

        this.api
          .addFileAttachmentBlob(attachment.id, fa, this.progress)
          .subscribe(f => console.log('f', f));
      });
      this.updateFileList();

    });

  }

  removeFile(attachment: FileAttachment) {
    if (this.field.attachments.has(attachment.name)) {
      const old = this.field.attachments.get(attachment.name);
      attachment.id = old.id;
      attachment.display_name = old.display_name;
      attachment.status = 'removed';
      this.field.attachments.set(attachment.name, attachment);
    }

    this.updateFileList();
  }

  editFileAttachment(attachment: FileAttachment, options) {
    attachment[options.key] = options.value;

    // If this is not the first time the file has been added,
    // set its status to 'updated'.
    if (attachment.status !== 'added') {
      attachment.status = 'updated';
    }

    this.field.attachments.set(attachment.name, attachment);
  }

  updateFileList() {
    this.updateFilesSubject.next(this.field.attachments);
  }
}
