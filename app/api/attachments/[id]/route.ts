import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getRows, SHEET_NAMES } from '@/lib/googleSheets';
import { streamPrivateFile } from '@/lib/googleDrive';
import { Complaint } from '@/types';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: fileId } = await context.params;

  try {
    // 1. Authorization check: Locate which complaint this file belongs to
    const complaints = await getRows<Complaint>(SHEET_NAMES.COMPLAINTS);
    const complaint = complaints.find(
      (c) => c.attachment_url === fileId || (c.attachment_url && c.attachment_url.includes(fileId))
    );

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    // If file is associated with a complaint, verify ownership
    if (complaint && !isAdmin && complaint.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to view this attachment.' },
        { status: 403 }
      );
    }

    // 2. Stream private file from Google Drive
    const fileData = await streamPrivateFile(fileId);

    // Convert node stream to Web ReadableStream for Next.js response
    const nodeStream = fileData.stream as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => controller.enqueue(chunk));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      },
    });

    const headers = new Headers();
    headers.set('Content-Type', fileData.mimeType);
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(fileData.name)}"`);
    if (fileData.size) {
      headers.set('Content-Length', String(fileData.size));
    }

    return new Response(webStream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error(`[GET /api/attachments/${fileId} Error]:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
