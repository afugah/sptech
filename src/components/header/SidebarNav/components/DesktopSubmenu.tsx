import { motion } from 'motion/react';
import React from 'react';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { Link } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';

const DesktopSubmenu = ({ desktopSubMenu }: { desktopSubMenu?: IShoplab.Children | null | undefined }) => {
  return (
    <motion.div
      key={'modal'}
      initial={{ opacity: 0.8, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.2 }}
      className={'fixed inset-0 left-[100rem] h-full  bg-alabaster  font-serif   lg:fixed lg:left-[28rem] lg:z-50'}
    >
      <ScrollArea className={'h-full w-full'}>
        <div className={'mt-[3rem] w-full px-4 py-5 pl-7'}>
          <Link href={(desktopSubMenu?.url as string)?.toUpperCase()} className={'font-serif text-4xl'}>
            {desktopSubMenu?.title}
          </Link>
          <hr className={' mt-4 h-[0.08rem] border-gray-300'} />
          <div className={'mb-6 mt-5 flex flex-col gap-y-8'}>
            <div className={'grid  h-auto gap-4 lg:grid-cols-3 xl:grid-cols-4 '}>
              {desktopSubMenu?.children?.map((item) => (
                <div key={item.id} className={'flex flex-col gap-y-3'}>
                  <Link href={item?.url?.toLowerCase()} className={'text-2xl font-semibold'}>
                    {item.label}
                  </Link>
                  <div className={'flex flex-col gap-y-2'}>
                    {item.items?.map((child) => (
                      <Link
                        href={child?.url?.toLowerCase()}
                        key={child.id}
                        className={'font-sans text-lg font-light text-gray-900 hover:text-gray-900 hover:underline '}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* <div className={' mt-14'}>
              <div className={`${desktopSubMenu?.images?.length! > 1 ? 'grid grid-cols-2 gap-4' : ''}`}>
                {desktopSubMenu?.images?.map((image) => (
                  <Image
                    width={1000}
                    height={1000}
                    quality={80}
                    key={image.id}
                    src={image.image.url}
                    alt={image.image.url}
                    className={'h-auto w-full object-cover object-center'}
                  />
                ))}
              </div>
            </div> */}
            {/* <div className={' w-full pt-8 '}>
              <div className={'grid gap-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3'}>
                {desktopSubMenu?.imagesWithUrl?.map((item) => (
                  <Card
                    key={item?.id}
                    className={'overflow-hidden rounded-none border-none bg-transparent shadow-none'}
                  >
                    <div className={'from-gray-100 relative aspect-[4/3] bg-gradient-to-br to-gray-200'}>
                      <Image
                        src={item.imageWithUrl?.image?.url || '/images/efva-category-1920x1080.jpg'}
                        alt={item.imageWithUrl?.image?.alt || ''}
                        fill
                        className={'object-cover object-center'}
                      />
                    </div>
                    <div className={'h-full px-4 md:px-7'}>
                      <div className={'relative  -top-8 border border-gray-300 bg-[#ece0db]  '}>
                        <div className={'flex h-full w-full items-center justify-center px-5 py-4 '}>
                          <CardContent className={' flex items-center justify-center px-0 py-0 text-center'}>
                            <Link
                              href={item?.imageWithUrl?.url}
                              className={' px-4  text-lg font-semibold uppercase  transition-colors'}
                            >
                              {item?.imageWithUrl?.linkText || 'Learn More'}
                            </Link>
                          </CardContent>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default DesktopSubmenu;
