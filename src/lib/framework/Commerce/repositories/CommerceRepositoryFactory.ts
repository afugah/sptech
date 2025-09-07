import { type FactoryProvider } from 'tsyringe';
import { type ICommerceRepository } from '@/src/lib/framework/Commerce/domain/ICommerceRepository';
import { BrinkCommerceRepository } from '@/src/lib/framework/Commerce/repositories/BrinkCommerceRepository';

export const commerceRepositoryFactory: FactoryProvider<ICommerceRepository> = {
  useFactory: (dependencyContainer) => {
    return dependencyContainer.resolve(BrinkCommerceRepository);
  },
};
