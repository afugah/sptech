import bwipjs from 'bwip-js';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ordernumber = searchParams.get('ordernumber');

  if (!ordernumber || typeof ordernumber !== 'string') {
    return new Response(JSON.stringify({ error: 'Barcode query parameter is required and must be a string' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: ordernumber,
      scale: 3,
      height: 7,
      includetext: false,
      textyoffset: 2,
      paddingwidth: 20,
      paddingheight: 7,
      backgroundcolor: 'ffffff',
    });

    return new Response(png as unknown as BodyInit, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (err) {
    console.error('Barcode generation error:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate barcode' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
