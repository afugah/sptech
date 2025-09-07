/* eslint-disable no-console */

import { inject, injectable } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';

/**
 * Logger service
 *
 * @example Inject the logger into a service
 * `@injectLogger('AlgoliaRepository') private readonly _logger: LoggerService,`
 */
@injectable()
export class LoggerService {
  private _serviceName: string = 'Unknown';
  private readonly _isDebug: boolean = false;

  public constructor(@inject(Tokens.Configuration) private readonly _config: IConfiguration) {
    this._isDebug = this._config.Debug ?? false;
  }

  public setServiceName(serviceName: string): void {
    this._serviceName = serviceName;
  }

  public log(...args: unknown[]): void {
    console.log('[LOG]', ...this.getMessage(...args));
  }

  public warn(...args: unknown[]): void {
    console.warn('[WARN]', ...this.getMessage(...args));
  }

  public error(...args: unknown[]): void {
    console.error('[ERROR]', ...this.getMessage(...args));
  }

  public info(...args: unknown[]): void {
    console.info('[INFO]', ...this.getMessage(...args));
  }

  public debug(...args: unknown[]): void {
    if (!this._isDebug) return;

    console.debug('[DEBUG]', ...this.getMessage(...args));
  }

  private getMessage(...args: unknown[]): unknown[] {
    return [`[${this._serviceName}]:`, ...args];
  }
}
