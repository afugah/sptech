import { type DependencyContainer } from 'tsyringe';
import { type ISocialMediaRepository } from '../domain/ISocialMediaRepository';
import { SocialMediaRepository } from './SocialMediaRepository';

export const socialMediaRepositoryFactory = {
  useFactory: (_di: DependencyContainer): ISocialMediaRepository => {
    return new SocialMediaRepository();
  },
};
