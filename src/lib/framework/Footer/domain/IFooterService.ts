import { type IFooter } from './entities/IFooter';

export interface IFooterService {
  getFooterData: (locale?: string) => Promise<IFooter>;
}
