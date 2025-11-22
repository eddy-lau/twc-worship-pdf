// src/services/drive.ts
import { getAccessToken } from './google';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export const searchPdf = async (songName: string): Promise<DriveFile | null> => {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');

  // Search for PDF files with the song name in the title
  // We search in all drives the user has access to, including Shared Drives
  const query = `name contains '${songName.replace(/'/g, "\\'")}' and mimeType = 'application/pdf' and trashed = false`;
  
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&supportsAllDrives=true&includeItemsFromAllDrives=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        throw new Error(`Drive API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      // Return the first match. You might want to improve this logic to find the "best" match.
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error searching for file:', error);
    throw error;
  }
};

export const downloadFile = async (fileId: string): Promise<ArrayBuffer> => {
  const token = getAccessToken();
  if (!token) throw new Error('No access token');

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        throw new Error(`Download error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
