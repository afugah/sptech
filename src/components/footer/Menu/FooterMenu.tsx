import { FooterMenuBlock } from '@/src/components/footer/Menu/FooterMenuBlock';
import { type Menu } from '@/src/types/framework/storyblok-components';

interface IFooterMenuProps {
  footer_menu: Menu[] | undefined;
}

export const FooterMenu: React.FC<IFooterMenuProps> = ({ footer_menu }) => {
  if (!footer_menu?.length) return null;

  return (
    <div className={'flex flex-col flex-wrap justify-between pb-1 text-secondary-800 lg:flex-row'}>
      {footer_menu?.map((menu: Menu) => {
        return <FooterMenuBlock key={menu._uid} menu={menu} />;
      })}
    </div>
  );
};
