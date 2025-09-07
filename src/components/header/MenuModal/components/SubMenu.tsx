import BackArrow from '@images/icons/arrow-left-long.svg';
import React, { useState } from 'react';
import { CollapseMenu } from '@/src/components/ui/CollapseMenu';
import { Link } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';

interface ISubMenu {
  subMenu?: IShoplab.NavigationItem;
  isSubMenuOpen: boolean;

  handleBackClick: () => void;
  handleMenuClick: (item: IShoplab.NavigationItem) => void;
}

export const SubMenu: React.FC<ISubMenu> = (props) => {
  const {
    subMenu,
    handleBackClick,
    isSubMenuOpen,
    // NOTE: Nested submenus are temporary disabled.
    // handleMenuClick,
  } = props;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!subMenu?.id) return null;

  const items = subMenu?.children || [];

  return (
    <>
      <div
        className={`absolute h-full flex-1 overflow-y-auto border-l border-gray-300 bg-alabaster px-8 pt-14 uppercase transition-all duration-300 ease-in-out sm:relative sm:w-80
        ${isSubMenuOpen ? 'w-full translate-x-0 opacity-100' : 'translate-x-full opacity-0'} 
      `}
      >
        <div
          role={'button'}
          onClick={handleBackClick}
          className={'flex cursor-pointer items-center space-x-2 border-b border-gray-300 p-5 pt-0 sm:hidden'}
        >
          <BackArrow className={'h-5 w-5'} />
          <span>{subMenu.title}</span>
        </div>

        <ul className={'m-0 flex flex-col gap-y-6 p-6 lg:relative lg:top-0 lg:flex lg:pl-0'}>
          {items.map((menuItem, index) => (
            <li key={menuItem.id || menuItem.title}>
              {menuItem.children?.length ? (
                <CollapseMenu title={menuItem.title} isOpen={openIndex === index} onToggle={() => handleToggle(index)}>
                  <ul className={'ml-2 mt-4 space-y-4'}>
                    {menuItem.children.map((child) => (
                      <li key={child.title} className={'text-gray-800 hover:text-gray-600'}>
                        <Link href={child.url} className={'block cursor-pointer transition-colors duration-300'}>
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapseMenu>
              ) : (
                <div
                  className={
                    'group flex cursor-pointer flex-row items-center justify-between text-black transition-colors duration-300 hover:text-gray-900'
                  }
                >
                  {menuItem.type === 'divider' ? (
                    <>
                      <span className={'h-1 w-full border border-b-gray-300'}></span>
                    </>
                  ) : menuItem.type !== 'custom' ? (
                    <>
                      <Link
                        href={menuItem.url}
                        className={'block cursor-pointer font-serif text-2xl transition-colors duration-300'}
                      >
                        {menuItem.title}
                      </Link>

                      {/* <span className={'ml-4'}>
                        <MenuArrow
                          className={
                            'my-auto hidden transform transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-x-4 lg:group-hover:opacity-100'
                          }
                        />
                      </span> */}
                    </>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
