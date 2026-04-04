import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * GET /api/polls/[shortId]/qr
 * Returns a QR code SVG for the poll URL.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { shortId: string } }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const pollUrl = `${appUrl}/poll/${params.shortId}`;

  try {
    const svg = await QRCode.toString(pollUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#FFD447',
        light: '#111118',
      },
      errorCorrectionLevel: 'M',
      width: 256,
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // cache 24h — QR never changes
      },
    });
  } catch (err) {
    console.error('[GET /api/polls/[shortId]/qr]', err);
    return NextResponse.json({ error: 'QR generation failed' }, { status: 500 });
  }
}
