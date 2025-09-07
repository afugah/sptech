import { type DependencyContainer } from 'tsyringe';
import { type IFooterRepository } from '../domain/IFooterRepository';
import { FooterRepository } from './FooterRepository';

export const footerRepositoryFactory = {
  useFactory: (_di: DependencyContainer): IFooterRepository => {
    return new FooterRepository();
  },
};
