import { type ISocialMedia } from './entities/ISocialMedia';

export interface ISocialMediaService {
  getSocialMediaLinks: (marketCode?: string) => Promise<ISocialMedia[]>;
}
