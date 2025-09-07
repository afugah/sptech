import { type InjectionToken } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';

/**
 * See explanation in `di.ts`
 */
export const Tokens = {
  Configuration: 'IConfiguration' as InjectionToken<IConfiguration>,
  LoggerService: 'LoggerService' as InjectionToken<LoggerService>,
} as const;
