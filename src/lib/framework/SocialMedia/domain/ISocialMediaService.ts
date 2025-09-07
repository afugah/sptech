import { type ISocialMedia } from './entities/ISocialMedia';

export interface ISocialMediaService {
  getSocialMediaLinks: (locale?: string) => Promise<ISocialMedia[]>;
}
