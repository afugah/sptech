'use client';
import Image from 'next/image';
import React from 'react';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select-custom';

const Newsletters = () => {
  return (
    <div className={'grid sm:grid-cols-2'}>
      <div className={'hidden sm:block'}>
        <Image
          src={'/images/newsletter.png'}
          alt={'newsletter'}
          width={1000}
          height={1000}
          quality={80}
          className={'h-full w-full object-cover'}
        />
      </div>
      <div className={'px-4 py-6 sm:px-6 lg:px-8'}>
        <div className={'flex h-full flex-col justify-center gap-y-4'}>
          <div className={'space-y-3 text-center'}>
            <h2 className={'text-xl font-medium uppercase leading-tight text-black/75 sm:text-2xl'}>
              subscribe to our <br /> newsletter & get 10% off
            </h2>
            <p className={'text-sm leading-relaxed text-gray-600 sm:text-base'}>
              Be the first on getting the latest news, exclusive promotions and inspiration.
            </p>
          </div>
          <div className={'w-full'}>
            <form className={'w-full space-y-4'}>
              <div className={'space-y-3'}>
                <Input
                  className={
                    'h-11 w-full rounded-none border-gray-300 bg-white px-3 text-gray-700 placeholder:text-sm placeholder:text-gray-500 focus:border-gray-500 focus:ring-0 focus-visible:ring-0'
                  }
                  id={'firstName'}
                  name={'firstName'}
                  placeholder={'First name'}
                  type={'text'}
                  required
                />
                <Select>
                  <SelectTrigger
                    className={
                      'h-11 w-full rounded-none border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-gray-500 focus:ring-0 focus-visible:ring-0'
                    }
                  >
                    <SelectValue placeholder={'Gender'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'male'}>Male</SelectItem>
                    <SelectItem value={'female'}>Female</SelectItem>
                    <SelectItem value={'other'}>Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className={
                    'h-11 w-full rounded-none border-gray-300 bg-white px-3 text-gray-700 placeholder:text-sm placeholder:text-gray-500 focus:border-gray-500 focus:ring-0 focus-visible:ring-0'
                  }
                  id={'email'}
                  name={'email'}
                  placeholder={'Email'}
                  type={'email'}
                  required
                />
              </div>
              <Button
                type={'submit'}
                variant={'custom'}
                className={
                  'w-full bg-backgroundAlternative py-3 text-sm font-medium uppercase text-white transition-colors hover:bg-backgroundAlternative/90 focus:ring-2 focus:ring-backgroundAlternative/20'
                }
              >
                Subscribe
              </Button>
            </form>
          </div>
          <p className={'text-sm leading-relaxed text-gray-500'}>
            *Valid on first-time and cannot be combined with other promotions or past purchase. Jewellery that are made
            to order, &quot;for a good cause&quot;, the HOGDALEN and giftcards are excluded from this discount.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletters;
