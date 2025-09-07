'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/shadcn/carousel';

interface CarouselComponentProps {
  children: React.ReactNode;
  className?: string;
  layoutMode?: 'carousel' | 'grid';
  gridCols?: number;
  title?: string;
  backgroundColor?: string;
  showNavigation?: boolean;
  carouselClassName?: string;
  carouselContentClassName?: string;
  gridClassName?: string;
}
interface ChildProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const CustomProductCarouselComponent = ({
  children,
  className,
  layoutMode = 'carousel',
  gridCols = 4,
  title,
  backgroundColor,
  showNavigation = true,
  carouselClassName,
  carouselContentClassName,
  gridClassName,
}: CarouselComponentProps) => {
  const getGridColsClass = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  if (layoutMode === 'grid') {
    return (
      <div className={cn('w-full', backgroundColor, className)}>
        {title && (
          <div className={'mb-14 text-center'}>
            <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{title}</h3>
          </div>
        )}
        <div className={cn('grid gap-7', getGridColsClass(gridCols), gridClassName)}>
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child) && child.props) {
              const props = child.props as ChildProps;
              const hasCarouselItemProps =
                'className' in props &&
                typeof props.className === 'string' &&
                (props.className.includes('basis-') || props.className.includes('pl-'));

              if (hasCarouselItemProps && props.children) {
                return (
                  <div key={index} className={'flex justify-center'}>
                    {props.children}
                  </div>
                );
              }
            }
            return (
              <div key={index} className={'flex justify-center'}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', backgroundColor, className)}>
      {title && (
        <div className={'mb-14 text-center'}>
          <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{title}</h3>
        </div>
      )}
      <Carousel
        className={cn('w-full bg-transparent px-9 md:px-14', carouselClassName)}
        opts={{
          align: 'start',
          loop: false,
          slidesToScroll: 1,
        }}
      >
        <div className={' px-0 '}>
          <CarouselContent className={cn('-ml-1  bg-transparent', carouselContentClassName)}>
            {children}
          </CarouselContent>
          {showNavigation && (
            <>
              <CarouselPrevious className={'hidden md:flex'} />
              <CarouselNext className={'hidden md:flex'} />
            </>
          )}
        </div>
        <CarouselDots className={'md:hidden'} />
      </Carousel>
    </div>
  );
};
export default CustomProductCarouselComponent;
