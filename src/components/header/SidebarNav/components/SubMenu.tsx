import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/src/components/shadcn/button';
import { NavigationMenu } from '@/src/components/shadcn/navigation-menu';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { Link } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';

const SubMenu = ({
  title,
  subMenu,
  setShowSubMenu,
}: {
  title: { url: string; title: string } | null;
  subMenu?: IShoplab.Child[] | null;
  setShowSubMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const t = useTranslations();

  const items = subMenu || [];
  return (
    <motion.div
      key={'modal'}
      initial={{ opacity: 0.8, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.2 }}
      className={' absolute inset-0 z-20 -mt-10  h-[42rem] bg-alabaster font-serif'}
    >
      <ScrollArea className={' h-[42rem] px-0'}>
        <Button
          role={'button'}
          type={'button'}
          aria-label={t('accessibility.back-to-menu')}
          variant={'custom'}
          onClick={() => setShowSubMenu(false)}
          className={'px-0 py-0 font-sans text-sm uppercase [&_svg]:size-7'}
        >
          <ArrowLeft strokeWidth={1} size={34} className={'mr-2 h-8 w-8 text-gray-600'} />
          {t('common.back')}
        </Button>
        <NavigationMenu className={'pb-3 pr-6 pt-7 uppercase'}>
          <Link href={(title?.url as string)?.toLowerCase()} className={'font-serif text-2xl'}>
            {title?.title}
          </Link>
          <hr className={' mt-6 h-[0.08rem] border-gray-300'} />
          <div className={'space-y-0 pt-4 font-sans text-sm'}>
            {items?.map((menuItem) => (
              <div key={menuItem.id} className={'space-y-2'}>
                {menuItem.items.length > 0 ? (
                  <>
                    {menuItem.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item?.url?.toLowerCase()}
                        className={'block px-0 py-1 font-medium hover:text-gray-900'}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link href={menuItem?.url} className={'block px-2 py-1 hover:text-gray-900'}>
                    {menuItem.label}
                  </Link>
                )}
                {/* <Link href={menuItem.url} className={'text-gray-800 hover:text-gray-900'}>
              {menuItem.label}
            </Link> */}
              </div>
            ))}
          </div>
        </NavigationMenu>
      </ScrollArea>
    </motion.div>
  );
};

export default SubMenu;
