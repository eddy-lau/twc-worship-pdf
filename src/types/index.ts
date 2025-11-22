export interface SongStatus {
  id: number;
  name: string;
  status: 'pending' | 'searching' | 'found' | 'not-found' | 'downloading' | 'downloaded' | 'error';
  message?: string;
  fileId?: string;
  data?: ArrayBuffer;
}
