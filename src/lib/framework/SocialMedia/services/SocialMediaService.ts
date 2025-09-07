import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type ISocialMediaRepository } from '@/src/lib/framework/SocialMedia/domain/ISocialMediaRepository';
import { type ISocialMediaService } from '@/src/lib/framework/SocialMedia/domain/ISocialMediaService';
import { socialMediaRepositoryFactory } from '@/src/lib/framework/SocialMedia/repositories/SocialMediaRepositoryFactory';

@singleton()
export class SocialMediaService implements ISocialMediaService {
  private readonly _repository: ISocialMediaRepository;

  public constructor(@injectLogger('SocialMediaService') private readonly _logger: LoggerService) {
    this._repository = socialMediaRepositoryFactory.useFactory(di);
  }

  public getSocialMediaLinks: ISocialMediaRepository['getSocialMediaLinks'] = (...args) =>
    this._repository.getSocialMediaLinks(...args).catch((err) => {
      this._logger.error('Error fetching social media links', err);
      throw err;
    });
}
