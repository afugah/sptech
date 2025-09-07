import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { appConfig } from '@/src/lib/configuration/appConfig';
import { Configuration, type IConfiguration } from '@/src/lib/configuration/Configuration';

export const initConfig = (): IConfiguration => {
  const config = plainToInstance(Configuration, appConfig);

  const validation = validateSync(config, { validationError: { target: false } });
  if (validation.length) throw new Error(`Configuration validation error:\n${JSON.stringify(validation, null, 1)}`);

  return config;
};
