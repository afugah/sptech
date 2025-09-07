import { type FactoryProvider } from 'tsyringe';
import { Tokens } from '@/src/lib/diTokens';
import { type IReviewRepository } from '@/src/lib/framework/Reviews/domain/IReviewRepository';
import { LipScoreRepository } from '@/src/lib/framework/Reviews/repositories/LipScoreRepository';
import { MockReviewRepository } from '@/src/lib/framework/Reviews/repositories/MockReviewRepository';
import { ReviewProviderEnum } from '@/src/lib/framework/Reviews/shared/ReviewProviderEnum';

export const reviewRepositoryFactory: FactoryProvider<IReviewRepository> = {
  useFactory: (dependencyContainer) => {
    const config = dependencyContainer.resolve(Tokens.Configuration);

    switch (config.Reviews?.Provider) {
      case ReviewProviderEnum.LipScore:
        return dependencyContainer.resolve(LipScoreRepository);

      default:
        return dependencyContainer.resolve(MockReviewRepository);
    }
  },
};
