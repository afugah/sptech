import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { ElasticSearchRepository } from '@/src/lib/framework/Product/repositories/ElasticSearchRepository';

export async function GET() {
  try {
    return await di.resolve(ElasticSearchRepository).getWarehouses().then(NextResponse.json);
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : err,
        headers,
        success: false,
      },
      { status: 400 },
    );
  }
}
