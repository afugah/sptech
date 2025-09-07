import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type IFooterRepository } from '@/src/lib/framework/Footer/domain/IFooterRepository';
import { type IFooterService } from '@/src/lib/framework/Footer/domain/IFooterService';
import { footerRepositoryFactory } from '@/src/lib/framework/Footer/repositories/FooterRepositoryFactory';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';

@singleton()
export class FooterService implements IFooterService {
  private readonly _repository: IFooterRepository;

  public constructor(@injectLogger('FooterService') private readonly _logger: LoggerService) {
    this._repository = footerRepositoryFactory.useFactory(di);
  }

  public getFooterData: IFooterRepository['getFooterData'] = (...args) =>
    this._repository.getFooterData(...args).catch((err) => {
      this._logger.error('Error fetching footer data', err);
      throw err;
    });
}
