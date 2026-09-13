import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { uploadPrivateAttachment, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const complaintId = (formData.get('complaint_id') as string) || `TEMP-${Date.now()}`;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, JPG, and PNG are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File exceeds 10MB limit.' },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadPrivateAttachment({
      complaintId,
      fileBuffer: buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      fileName: result.fileName,
      mimeType: result.mimeType,
      size: result.size,
    });
  } catch (error: any) {
    console.error('[POST /api/upload Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Google Drive upload failed' },
      { status: 500 }
    );
  }
}
