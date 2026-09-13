import { google } from 'googleapis';
import { Readable } from 'stream';
import { getGoogleAuthClient } from './googleSheets';

let driveClientInstance: ReturnType<typeof google.drive> | null = null;

export function getDriveClient() {
  if (!driveClientInstance) {
    const auth = getGoogleAuthClient();
    driveClientInstance = google.drive({ version: 'v3', auth });
  }
  return driveClientInstance;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB default

/**
 * Find or create a subfolder in Google Drive.
 */
async function getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
  const drive = getDriveClient();
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  try {
    const searchRes = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id!;
    }

    // Create folder
    const folderMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
      folderMetadata.parents = [parentId];
    }

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id!;
  } catch (error: any) {
    console.error(`[GoogleDrive getOrCreateFolder "${folderName}" Error]:`, error?.message || error);
    throw new Error(
      `Failed to access or create Google Drive folder "${folderName}": ${error?.message || 'Access Denied'}`
    );
  }
}

/**
 * Creates the complaint folder structure:
 * Campus Complaint System -> Complaint Attachments -> [complaintId]
 */
export async function getComplaintFolder(complaintId: string): Promise<string> {
  const rootDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Root level: Campus Complaint System
  const mainFolderId = await getOrCreateFolder('Campus Complaint System', rootDriveFolderId || undefined);
  // Second level: Complaint Attachments
  const attachmentsFolderId = await getOrCreateFolder('Complaint Attachments', mainFolderId);
  // Third level: CMP-2026-XXXXX
  const complaintFolderId = await getOrCreateFolder(complaintId, attachmentsFolderId);

  return complaintFolderId;
}

/**
 * Uploads an attachment to the complaint's private folder in Google Drive.
 * NOTE: Files remain strictly PRIVATE (no public link created).
 */
export async function uploadPrivateAttachment({
  complaintId,
  fileBuffer,
  fileName,
  mimeType,
}: {
  complaintId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ fileId: string; fileName: string; mimeType: string; size: number }> {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    throw new Error(
      `Invalid file type "${mimeType}". Only PDF, JPG, and PNG documents are supported.`
    );
  }

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed limit of 10MB.`
    );
  }

  const drive = getDriveClient();
  const folderId = await getComplaintFolder(complaintId);

  const readableStream = new Readable();
  readableStream.push(fileBuffer);
  readableStream.push(null);

  try {
    const file = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: readableStream,
      },
      fields: 'id, name, mimeType, size',
    });

    return {
      fileId: file.data.id!,
      fileName: file.data.name || fileName,
      mimeType: file.data.mimeType || mimeType,
      size: Number(file.data.size || fileBuffer.length),
    };
  } catch (error: any) {
    console.error(`[GoogleDrive uploadPrivateAttachment Error for ${complaintId}]:`, error?.message || error);
    throw new Error(
      `Google Drive upload failed for complaint "${complaintId}": ${error?.message || 'Drive API rejected request'}`
    );
  }
}

/**
 * Securely stream a private Google Drive file for authenticated download.
 */
export async function streamPrivateFile(fileId: string) {
  const drive = getDriveClient();

  try {
    const metadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    });

    const fileStream = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      stream: fileStream.data,
      name: metadata.data.name || 'attachment',
      mimeType: metadata.data.mimeType || 'application/octet-stream',
      size: metadata.data.size,
    };
  } catch (error: any) {
    console.error(`[GoogleDrive streamPrivateFile Error for ${fileId}]:`, error?.message || error);
    throw new Error(
      `Failed to retrieve private file from Google Drive: ${error?.message || 'File not found or permission denied'}`
    );
  }
}
