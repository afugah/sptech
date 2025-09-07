import classNames from 'classnames';
import { FooterMenuItem } from '@/src/components/footer/Menu/FooterMenuItem';
import { type Menu } from '@/src/types/framework/storyblok-components';

interface IFooterMenuBlockProps {
  menu: Menu;
}

export const FooterMenuBlock: React.FC<IFooterMenuBlockProps> = ({ menu }) => (
  <div className={'flex flex-1 flex-col items-center pr-5 lg:items-start'} key={menu._uid}>
    <h3 className={'my-2.5 font-sans text-sm text-black'}>{menu.title}</h3>

    <div className={classNames('ml-2 grid transition-[grid-template-rows,opacity] duration-300 lg:ml-0 lg:block')}>
      <ul className={'overflow-hidden'}>
        {menu?.links.map(
          (menuLink) => menuLink.title !== 'hidden' && <FooterMenuItem key={menuLink._uid} menuLink={menuLink} />,
        )}
      </ul>
    </div>
  </div>
);
