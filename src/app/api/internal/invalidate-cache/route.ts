import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';

export async function POST(req: NextRequest) {
  const _logger = di.resolve(LoggerService);
  _logger.setServiceName('API.internal/invalidate-cache');

  const serverSecret = process.env.CACHE_INVALIDATION_SECRET;
  if (!serverSecret) {
    _logger.error('Cache invalidation is not enabled');
    return NextResponse.json({ success: false, message: 'Cache invalidation is not enabled' }, { status: 500 });
  } else if (serverSecret.length < 32) {
    _logger.warn('Invalid cache invalidation secret. Minimum length is 32 characters');
    return NextResponse.json(
      { success: false, message: 'Cache invalidation is not configured correctly' },
      { status: 500 },
    );
  }

  const headersList = await headers();
  const secret = headersList.get('x-cache-invalidation-secret');
  if (serverSecret !== secret) {
    _logger.warn('Unauthorized access!');
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tag, paths } = await req.json();
    const invalidated: Record<'tags' | 'paths', string[]> = {
      tags: [],
      paths: [],
    };

    if (!tag && !paths) {
      _logger.warn('No tag or path provided');
      return NextResponse.json({ success: false, message: 'No tag or path provided' }, { status: 400 });
    }

    if (isValidTag(tag)) {
      revalidateTag(tag);
      invalidated.tags.push(tag);
    } else if (tag) {
      _logger.warn('Invalid tag provided', { tag: tag });
      return NextResponse.json({ success: false, message: 'Invalid tag provided' }, { status: 400 });
    }

    if (isValidPaths(paths)) {
      paths.forEach((path) => {
        revalidatePath(path);
        invalidated.paths.push(path);
      });
    } else if (paths) {
      _logger.warn('Invalid paths provided', { paths });
      return NextResponse.json({ success: false, message: 'Invalid paths provided' }, { status: 400 });
    }

    _logger.info('Cache invalidated', invalidated);
    return NextResponse.json({ success: true, message: `Cache invalidated`, invalidated });
  } catch (err) {
    _logger.error('Failed to parse request body', err);
    return NextResponse.json({ success: false, message: 'Failed to invalidate cache' }, { status: 400 });
  }
}

const isValidTag = (tag: unknown): tag is string => typeof tag === 'string' && tag.length > 0;

const isValidPaths = (paths: unknown): paths is string[] =>
  Array.isArray(paths) && paths.every((path) => typeof path === 'string');
