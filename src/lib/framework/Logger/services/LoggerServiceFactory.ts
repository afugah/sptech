import { type FactoryProvider } from 'tsyringe';
import { LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';

export const loggerServiceFactory: FactoryProvider<LoggerService> = {
  useFactory: (dependencyContainer) => dependencyContainer.resolve(LoggerService),
};
