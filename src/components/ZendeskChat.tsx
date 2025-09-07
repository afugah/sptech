'use client';

import { useEffect } from 'react';
import { usePathname } from '@/src/i18n/navigation';

const LANGUAGE_CODES = ['se', 'en', 'no', 'fi'];

export const ZendeskChat = () => {
  const pathname = usePathname();

  useEffect(() => {
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    const isNonHomePage = normalizedPath.length > 0 && !LANGUAGE_CODES.includes(normalizedPath);

    if (!isNonHomePage) return;

    const existingScript = document.getElementById('ze-snippet');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = 'https://static.zdassets.com/ekr/snippet.js?key=d7c0e19d-b4de-4ac6-8213-ba5a8a5fe2c9';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('ze-snippet');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, [pathname]);

  return null;
};
