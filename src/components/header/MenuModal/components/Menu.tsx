import classNames from 'classnames';
import { useMemo } from 'react';
import { usePage } from '@/src/context/pageContext';
import { Link } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';
import { type IMenuItems } from '../index';

interface IMenu {
  headerMenu?: IShoplab.NavigationItem[];
  handleMenuClick: (item: IShoplab.NavigationItem) => void;
  followUsItems?: IMenuItems[];
  activeSubMenu?: IShoplab.NavigationItem | null;
  startLevel?: number; // 0 = show all levels, 1 = skip first level, etc.
}

export const Menu: React.FC<IMenu> = ({
  headerMenu,
  handleMenuClick,
  followUsItems,
  activeSubMenu,
  startLevel = 0,
}) => {
  const { isMenuOpen } = usePage();

  // Extract categories based on the specified start level
  const [categories, links] = useMemo(() => {
    // If startLevel is 0, use the original menu structure
    if (startLevel === 0) {
      return (
        headerMenu?.reduce<[IShoplab.NavigationItem[], IShoplab.NavigationItem[]]>(
          (result, item) => {
            if (item.children?.length) {
              result[0].push(item);
            } else {
              result[1].push(item);
            }
            return result;
          },
          [[], []],
        ) ?? [[], []]
      );
    }
    // For startLevel > 0, we need to navigate down the hierarchy
    let currentItems = headerMenu;
    let currentLevel = 0;

    // Navigate down to the desired level
    while (currentLevel < startLevel && currentItems?.length) {
      // Find the first item with children at the current level
      const itemWithChildren = currentItems.find((item) => item.children?.length > 0);

      // If we can't go deeper, break out
      if (!itemWithChildren?.children?.length) {
        break;
      }

      // Go one level deeper
      currentItems = itemWithChildren.children;
      currentLevel++;
    }

    // Now process the items at the current level
    return (
      currentItems?.reduce<[IShoplab.NavigationItem[], IShoplab.NavigationItem[]]>(
        (result, item) => {
          if (item.children?.length) {
            result[0].push(item);
          } else {
            result[1].push(item);
          }
          return result;
        },
        [[], []],
      ) ?? [[], []]
    );
  }, [headerMenu, startLevel]);

  return (
    <div
      className={classNames('relative mt-8 flex-1 pb-14 transition-all duration-300 ease-in-out lg:flex', {
        'w-0 opacity-0': !isMenuOpen,
        'w-full opacity-100 sm:w-60': isMenuOpen,
      })}
    >
      <div className={`flex h-full w-full transform flex-col justify-between transition-transform duration-300`}>
        <div className={'flex flex-col gap-y-6'}>
          {!!categories.length && (
            <ul className={'m-0 flex flex-col gap-y-6 lg:relative lg:top-0 lg:flex lg:p-0'}>
              {categories.map((item) => (
                <li
                  role={'button'}
                  key={item.id}
                  className={
                    'group flex cursor-pointer flex-row items-center justify-between font-serif text-2xl text-black transition-colors duration-300 hover:text-gray-900'
                  }
                  onClick={() => handleMenuClick?.(item)}
                >
                  <span
                    className={classNames('block', {
                      '': activeSubMenu?.id === item.id,
                    })}
                  >
                    {item.title}
                  </span>

                  {/* <span className={'ml-4'}>
                    <MenuArrow
                      className={
                        'my-auto hidden transform transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-x-4 lg:group-hover:opacity-100'
                      }
                    />
                  </span> */}
                </li>
              ))}
            </ul>
          )}

          {!!categories.length && !!links.length && <hr className={'w-full border-gray-300'} />}
          {!!links.length && (
            <ul className={'m-0 flex flex-col gap-y-6 lg:relative lg:top-0 lg:flex lg:p-0'}>
              {links.map((menuItem) => (
                <li
                  key={menuItem.id}
                  className={'text-black transition-colors duration-300 hover:text-gray-700 hover:underline'}
                >
                  <Link href={menuItem.url} className={'block cursor-pointer'}>
                    {menuItem.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className={'mb-6 border-b border-gray-300'} />
          <ul className={'m-0 flex flex-col gap-y-6 lg:relative lg:top-0 lg:flex lg:p-0'}>
            {/* <li className={'text-black transition-colors duration-300 hover:text-gray-700 hover:underline'}>
              <a className={'block'}>Follow Us</a>
            </li> */}

            {followUsItems?.map((menuItem) => (
              <li
                key={menuItem.link}
                className={'text-gray transition-colors duration-300 hover:text-gray-700 hover:underline'}
              >
                <a href={menuItem.link} target={'_blank'} className={'block'}>
                  {menuItem.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
