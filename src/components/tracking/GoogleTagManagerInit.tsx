import { GoogleTagManager } from '@next/third-parties/google';
import React from 'react';

const CustomGoogleTagManager: React.FC = () => {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    console.warn('Google Tag Manager ID is not defined in the environment variables.');
    return null;
  }

  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height={'0'}
          width={'0'}
          style={{ display: 'none', visibility: 'hidden' }}
        ></iframe>
      </noscript>
      <GoogleTagManager gtmId={gtmId} />
    </>
  );
};

export default CustomGoogleTagManager;
