import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
  
  // Construct the internal PocketBase file URL
  const internalUrl = `${pbUrl.replace(/\/$/, '')}/api/files/${path}`;

  try {
    const response = await fetch(internalUrl, {
      // Pass through headers if needed, but usually not required for public files
      cache: 'no-cache',
    });

    if (!response.ok) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Get the content type (image/png, image/jpeg, etc.)
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the image data directly
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
