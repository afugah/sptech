import { useLayoutEffect, useState } from 'react';

export const useBodyWidth = () => {
  const [width, setWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const handleResize = () => setWidth(document.body.clientWidth);

    document.body.addEventListener('resize', handleResize);
    handleResize();

    return () => document.body.removeEventListener('resize', handleResize);
  });

  return width;
};
