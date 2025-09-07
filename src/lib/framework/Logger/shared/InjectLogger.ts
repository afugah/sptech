import { injectWithTransform } from 'tsyringe';
import { type Transform } from 'tsyringe/dist/typings/types';
import { Tokens } from '@/src/lib/diTokens';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';

class Transformer implements Transform<LoggerService, LoggerService> {
  public transform(logger: LoggerService, serviceName: string): LoggerService {
    logger.setServiceName(serviceName);

    return logger;
  }
}

export function injectLogger(serviceName: string) {
  return injectWithTransform(Tokens.LoggerService, Transformer, serviceName);
}
