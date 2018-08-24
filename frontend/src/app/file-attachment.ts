export interface FileAttachment extends File {
  ref_id?: number;
  description?: string;
  status?: string; // added | removed | updated
}
