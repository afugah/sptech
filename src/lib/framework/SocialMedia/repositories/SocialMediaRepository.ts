import { type ISocialMedia } from '../domain/entities/ISocialMedia';
import { type ISocialMediaRepository } from '../domain/ISocialMediaRepository';
import { type ICMSSocialMediaResponse, type ISocialMediaPayloadResponse } from '../types/ICMS';

export class SocialMediaRepository implements ISocialMediaRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3001';
  }

  async getSocialMediaLinks(locale: string = 'en'): Promise<ISocialMedia[]> {
    const url = new URL(`${this.baseUrl}/api/social-media-links`);
    url.searchParams.set('limit', '50');
    url.searchParams.set('depth', '1');
    url.searchParams.set('locale', locale);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS API returned ${response.status}`);
    }

    const data: ISocialMediaPayloadResponse = await response.json();

    // Transform CMS response to domain entities
    return data.docs.map(this.transformSocialMediaData);
  }

  private transformSocialMediaData(cmsData: ICMSSocialMediaResponse): ISocialMedia {
    return {
      id: cmsData.id,
      platform: cmsData.platform,
      url: cmsData.url,
      icon: cmsData.icon,
      createdAt: cmsData.createdAt,
      updatedAt: cmsData.updatedAt,
    };
  }
}
