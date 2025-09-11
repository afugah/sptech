import { type IFooter } from './entities/IFooter';

export interface IFooterService {
  getFooterData: (marketCode?: string) => Promise<IFooter>;
}
