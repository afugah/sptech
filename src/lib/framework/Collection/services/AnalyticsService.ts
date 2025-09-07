import { singleton } from 'tsyringe';
import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';

type AnalyticsInstance = {
  sendEvent: (event: FeedbackEvent, properties: FeedbackBody<FeedbackEvent>['properties']) => void;
};

@singleton()
export class AnalyticsService {
  private readonly analyticsInstances: Map<string, AnalyticsInstance> = new Map();

  private async createAnalyticsInstance(apiKey: string): Promise<AnalyticsInstance> {
    if (typeof window === 'undefined') {
      console.warn('FindifyAnalytics can only be initialized in a client environment');
      return Promise.reject(new Error('FindifyAnalytics cannot be initialized during SSR'));
    }

    try {
      const { default: FindifyAnalytics } = await import('@findify/analytics');
      const instance = FindifyAnalytics({
        key: apiKey,
        platform: 'web',
      });
      return instance;
    } catch (error) {
      console.error('Error initializing FindifyAnalytics:', error);
      throw error;
    }
  }

  public async getAnalyticsInstance(apiKey: string): Promise<AnalyticsInstance | undefined> {
    if (!this.analyticsInstances.has(apiKey)) {
      try {
        const instance = await this.createAnalyticsInstance(apiKey);
        this.analyticsInstances.set(apiKey, instance);
      } catch (error) {
        console.error(`Error creating analytics instance for ${apiKey}:`, error);
        return undefined;
      }
    }
    return this.analyticsInstances.get(apiKey);
  }

  public async sendEvent(
    apiKey: string,
    event: FeedbackEvent,
    properties: FeedbackBody<FeedbackEvent>['properties'],
  ): Promise<void> {
    try {
      const instance = await this.getAnalyticsInstance(apiKey);
      if (instance) {
        instance.sendEvent(event, properties);
      } else {
        console.warn(`Analytics instance not found for API key ${apiKey}`);
      }
    } catch (error) {
      console.error(`Failed to send event:`, error);
    }
  }
}
