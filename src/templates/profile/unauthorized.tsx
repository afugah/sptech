'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/context/authContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { useRouter } from '@/src/i18n/navigation';
import { UserModalViewEnum } from '@/src/lib/types/common';

export const Unauthorized: React.FC = () => {
  const { setShowView } = useUserDrawer();

  const { refresh } = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) refresh();
  }, [isSignedIn, refresh]);

  const onSignInClick = () => {
    setShowView(UserModalViewEnum.LOGIN);
  };
  const t = useTranslations();
  return (
    <div className={'my-8 flex flex-col items-center justify-center gap-8'}>
      <div className={'flex flex-col items-center justify-center gap-4'}>
        <h2>{t('profile.unauthorized.title')}</h2>
        <p>{t('profile.unauthorized.description')}</p>
      </div>

      <Button onClick={onSignInClick} buttonType={Button.Type.Filled} className={'min-w-32'}>
        {t('profile.unauthorized.title')}
      </Button>
    </div>
  );
};
