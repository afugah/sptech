import { serialize } from 'cookie';
import { type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { contactId } = await req.json();

    // Check if the client-side cookie exists
    const clientCookie = req.cookies.get('_vaI')?.value;

    if (clientCookie && clientCookie !== 'undefined' && clientCookie.trim() !== '' && clientCookie === contactId) {
      // Create response with headers
      return new Response(JSON.stringify({ message: 'Cookie set successfully' }), {
        status: 200,
        headers: {
          'Set-Cookie': serialize('_vaI_server', contactId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
          }),
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Invalid or missing client cookie' }), { status: 400 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 },
    );
  }
}
