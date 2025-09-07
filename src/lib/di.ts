import 'server-only';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { initConfig } from '@/src/lib/configuration';
import { Tokens } from '@/src/lib/diTokens';
import { loggerServiceFactory } from '@/src/lib/framework/Logger/services/LoggerServiceFactory';

/**
 * Only global containers are registered here.
 * All other containers should be resolved by the implementation or a factory.
 *
 * **Explanation**: Next.js creates a new, completely separate worker with
 * its own global context for every request.
 *
 * As a result, every single page or endpoint that utilizes this `di.ts`
 * file will register and instantiate all the containers on each user request.
 *
 * However, this also means that the `reflect-metadata` package must be
 * initialized in any location that uses Dependency Injection.
 *
 * Thus, this file serves as the entry point for the entire DI system.
 *
 * @example
 * `const voyadoRepository = di.resolve(VoyadoRepository)`
 */

container.register(Tokens.Configuration, { useValue: initConfig() });
container.register(Tokens.LoggerService, loggerServiceFactory);

export const di = Object.assign(container, { Tokens });
