import { di } from '@lib/di';
import { CollectionService } from '@lib/framework/Collection/services/CollectionService';
import { LoggerService } from '@lib/framework/Logger/services/LoggerService';
import { type NextRequest, NextResponse } from 'next/server';
import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';

export async function POST(req: NextRequest) {
  const _logger = di.resolve(LoggerService);
  _logger.setServiceName('API.internal/post-feedback');

  try {
    const {
      marketCode,
      event,
      properties,
    }: {
      marketCode: string;
      event: FeedbackEvent;
      properties: FeedbackBody<FeedbackEvent>['properties'];
    } = await req.json();

    const collectionService = di.resolve(CollectionService);

    const result: { status: number; message: string; error?: { message: string } } | null =
      await collectionService.postFeedback(marketCode, event, properties);

    if (!result || result.error) {
      const errorMessage = result?.error?.message || 'Failed to post feedback due to missing or invalid result';
      _logger.error('Error posting feedback', { marketCode, event, error: result?.error });
      return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }

    _logger.info('Feedback posted successfully', { marketCode, event, result });

    return NextResponse.json({
      success: true,
      message: result.message || 'Feedback posted successfully',
      status: result.status,
    });
  } catch (error) {
    _logger.error('Failed to post feedback', { error });
    return NextResponse.json({ success: false, message: 'Failed to post feedback' }, { status: 500 });
  }
}
