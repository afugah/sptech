'use client';
import Image from 'next/image';
import React from 'react';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select-custom';

const Newsletters = () => {
  //   const locale = useLocale();
  //   useEffect(() => {
  //     const fetchNewsletters = async () => {
  //       try {
  //         const response = await fetchPageData(locale, 'beauty-with-a-thought');

  //         console.log(response);
  //       } catch (error) {
  //         console.error('Error fetching newsletters:', error);
  //       }
  //     };
  //     fetchNewsletters();
  //   }, [locale]);

  return (
    <div className={'grid  sm:grid-cols-2'}>
      <div className={' hidden sm:block'}>
        <Image
          src={'/images/newsletter.png'}
          alt={'newsletter'}
          width={1000}
          height={1000}
          quality={80}
          className={' h-full w-full'}
        />
      </div>
      <div className={' px-2 py-3 pl-6'}>
        <div className={' flex flex-col justify-center  gap-y-3 '}>
          <div className={'space-y-2 text-center'}>
            <p className={' text-xl font-medium uppercase text-black/75'}>
              subscribe to our <br /> newsletter & get 10% off
            </p>
            <p className={' track text-gratracking-wider leading-relaxed'}>
              Be the first on getting the latest news, exclusive promotions and inspiration.
            </p>
          </div>
          <div>
            <form action={''} className={'w-full'}>
              <div className={' w-full space-y-2'}>
                <Input
                  className={
                    '  h-10 w-full rounded-none bg-white  px-2 text-gray-700 outline-none placeholder:text-sm placeholder:text-gray-700   focus:ring-0 focus-visible:ring-0 '
                  }
                  id={'firstName'}
                  name={'firstName'}
                  placeholder={'First name'}
                  defaultValue={''}
                />
                <Select onValueChange={() => {}}>
                  <SelectTrigger
                    className={` h-10 bg-white px-2 text-sm  text-gray-700 outline-none placeholder:text-xxs placeholder:uppercase placeholder:text-gray-700   focus:ring-0 focus-visible:ring-0
                       `}
                  >
                    <SelectValue
                      placeholder={'Gender'}
                      className={'text-xxs placeholder:text-xxs placeholder:text-gray-600 '}
                    />
                  </SelectTrigger>
                  <SelectContent className={'cursor-pointer'}>
                    <SelectItem value={'male'}>Male</SelectItem>
                    <SelectItem value={'female'}>Female</SelectItem>
                    <SelectItem value={'other'}>Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className={
                    ' h-10 w-full rounded-none bg-white px-2  text-gray-700 outline-none placeholder:text-sm placeholder:text-gray-700 focus:ring-0 focus-visible:ring-0 '
                  }
                  id={'email'}
                  name={'email'}
                  placeholder={'Email'}
                  defaultValue={''}
                />
              </div>
              <div>
                <Button
                  variant={'custom'}
                  className={'mt-2  w-full bg-backgroundAlternative py-4 uppercase text-white'}
                >
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
          <p className={' pt-0 text-xxs text-gray-600'}>
            *Valid on first-time and cannot be combined with other promotions or past purchase. Jewellery that are made
            to order, &quot;for a good cause&quot;, the HOGDALEN and giftcards are excluded from this discount.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletters;
