import Image from 'next/image';
import React from 'react';

const NotFound = () => (
  <div
    className={
      'mx-auto mb-60 flex min-h-screen w-full flex-col items-center gap-10 bg-[#F5F2EC] px-12 py-16 text-center'
    }
  >
    <Image src={'/images/404.png'} alt={'404'} width={580} height={368} />

    <h2 className={'text-4xl'}>Page Not Found</h2>

    <div className={'font-sans text-lg text-gray lg:max-w-[50%]'}>
      <p>Sorry, the page you are looking for could not be found.</p>
    </div>

    <a href={'/'} className={'inline-block rounded bg-black px-6 py-3 text-white hover:bg-gray-800'}>
      <span className={'mr-2 text-sm'}>← </span> Go to Homepage
    </a>
  </div>
);

export default NotFound;
