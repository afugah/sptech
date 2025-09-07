import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import {
  type Entries,
  type GiftBottomGrid,
  type ImageTextItems,
  type ProductCardDisplay,
} from '@/src/types/framework/storyblok-components';
import { type StoryblokContent } from '@/src/types/framework/storyblok-helpers';
import CustomProductCarouselComponent from '../product/CustomProductCarousel';
import { CarouselItem } from '../shadcn/carousel';

const EntriesComponent: IStoryblok.FC<Entries> = ({ blok }) => {
  const { blocks, productItems } = blok;

  return (
    <div className={'mb-0 h-full bg-alabaster pb-36 font-light'}>
      <div className={' space-y-24 px-4 pt-16  md:space-y-32 lg:px-5 xl:px-9'}>
        {(blocks as ImageTextItems[])?.map((item) => {
          const position = item.imagePosition || 'left';
          return (
            <div key={item?._uid}>
              <div className={'px-1 lg:px-12 xl:px-20'}>
                <div className={'grid grid-cols-1 gap-4 gap-x-9 gap-y-14 lg:grid-cols-2'}>
                  {/* Image */}
                  <div className={`w-full overflow-hidden  ${position === 'right' ? 'lg:order-2' : ''}`}>
                    <Image
                      src={item?.image?.filename || '/images/efva-category-1920x1080.jpg'}
                      alt={item?.image?.alt || ''}
                      width={1920}
                      height={1080}
                      className={
                        'h-[24rem] w-[37rem] object-cover object-center sm:h-full sm:w-full  lg:h-[29rem] lg:w-[31rem] '
                      }
                    />
                  </div>

                  {/* Text Content */}
                  <div className={'space-y-7 lg:pt-10'}>
                    {(item.items as GiftBottomGrid[]).map((item) => (
                      <div key={item?._uid} className={'space-y-7 lg:pt-10'}>
                        <p className={'font-serif text-3xl font-semibold lg:text-5xl '}>{item?.title}</p>
                        {item.items?.map((textItem: StoryblokContent) => (
                          <div key={textItem?._uid as string} className={' space-y-6 font-light text-black/60'}>
                            <StoryblokComponent blok={textItem} key={textItem._uid as string} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={'mb-16 mt-44'}>
                {(productItems as ProductCardDisplay[])?.length > 0 &&
                  (productItems as ProductCardDisplay[])?.map((productItem) => {
                    // const backgroundColorClass =
                    //   productItem?.backgroundColor && sectionBackgroundColorConst[productItem?.backgroundColor.value];
                    const checkNumItems =
                      ((productItem?.products as StoryblokContent)?.items as unknown[])?.length || 0;
                    return (
                      <div key={productItem?._uid} className={``}>
                        <div className={'bg-transparent'}>
                          <CustomProductCarouselComponent
                            layoutMode={checkNumItems < 4 ? 'grid' : productItem?.layoutMode || 'grid'}
                            gridCols={Number(productItem?.itemsPerView) || 3}
                            title={productItem?.title}
                            backgroundColor={'bg-transparent'}
                            showNavigation={true}
                            carouselContentClassName={'h-[26rem]'}
                          >
                            {((productItem?.products as StoryblokContent)?.items as unknown[])?.length > 0 &&
                              ((productItem?.products as StoryblokContent)?.items as unknown[])?.map(
                                (productData: unknown) => {
                                  const product = productData as {
                                    image: string;
                                    name: string;
                                    id: string;
                                    price: string;
                                    product_sku: string;
                                  };
                                  return (
                                    <CarouselItem
                                      key={product.id}
                                      className={'h-auto pl-2 md:basis-1/2 md:pl-9 lg:basis-[33%]'}
                                    >
                                      <div key={blok._uid} className={'relative'}>
                                        <div className={'relative'}>
                                          {product?.image && (
                                            <Image
                                              className={'h-[350px] w-full object-cover md:h-[320px]'}
                                              height={1000}
                                              width={1000}
                                              src={product?.image}
                                              alt={product?.name || ''}
                                            />
                                          )}

                                          <div
                                            className={
                                              'absolute -bottom-12 left-1/2 z-50 w-11/12 -translate-x-1/2 bg-creme-200 p-6'
                                            }
                                          >
                                            <h3 className={' bg-creme p-2 text-center text-lg font-light'}>
                                              {product?.name}
                                            </h3>
                                          </div>
                                        </div>
                                      </div>
                                    </CarouselItem>
                                  );
                                },
                              )}
                          </CustomProductCarouselComponent>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntriesComponent;
