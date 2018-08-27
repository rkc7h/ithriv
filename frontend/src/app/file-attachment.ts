export interface FileAttachment extends File {
  id?: number;
  name: string;
  display_name?: string;
  last_modified?: Date;
  url?: string;
  md5?: string;
  status?: string; // added | removed | updated
}
