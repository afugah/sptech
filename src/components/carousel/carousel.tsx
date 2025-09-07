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

export function CarouselComponent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Carousel
      className={cn('w-full bg-transparent px-0 md:px-4 lg:px-12', className)}
      opts={{
        align: 'start',
        loop: false,
        slidesToScroll: 1,
      }}
    >
      <div className={' px-3 '}>
        <CarouselContent className={'-ml-2 bg-transparent lg:-ml-1'}>{children}</CarouselContent>
        <CarouselPrevious className={'hidden lg:flex'} />
        <CarouselNext className={'hidden lg:flex'} />
      </div>
      <CarouselDots className={'lg:hidden'} />
    </Carousel>
  );
}
