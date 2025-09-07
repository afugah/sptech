'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import Overlay from '@/src/components/ui/OverLay';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type IntroBanner } from '@/src/types/framework/storyblok-components';

enum IntroModalState {
  Hidden = 0,
  Visible = 1,
  Closed = 2,
}

export const IntroModalBlock: IStoryblok.FC<IntroBanner> = ({ blok }) => {
  const t = useTranslations();
  const { id, title, message } = blok;

  const localStorageKey = useMemo(() => `intro-modal_${id}`, [id]);

  const [isVisible, setIsVisible] = useState<IntroModalState>(IntroModalState.Hidden);

  const setStorageValue = useCallback(
    (value: IntroModalState) => {
      if (typeof window === 'undefined') return;

      setIsVisible(value);
      localStorage.setItem(localStorageKey, value.toString());
    },
    [localStorageKey],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const value = (+(localStorage.getItem(localStorageKey) || 1) as IntroModalState) || 1;
    setStorageValue(+value || 1);
  }, [localStorageKey, setStorageValue]);

  const onClose = () => setStorageValue(IntroModalState.Closed);

  if (isVisible !== IntroModalState.Visible || !title) return null;

  return (
    <div className={'fixed inset-0 z-[100] mb-6 flex items-end justify-center'}>
      <Overlay isVisible setIsVisible={onClose} />

      <div className={'z-[101] w-11/12 rounded-lg bg-white p-6 shadow-lg lg:w-2/3'}>
        <div className={'mb-1 flex items-center justify-between'}>
          <h2 className={'text-lg font-semibold'}>{title}</h2>

          <button onClick={onClose} className={'text-gray-400 transition-colors hover:text-gray-600'}>
            ✕
          </button>
        </div>

        <div className={'mb-4'}>
          <p className={'whitespace-pre-wrap text-sm'}>{message}</p>
        </div>

        <div className={'flex justify-center'}>
          <Button buttonType={Button.Type.Filled} onClick={onClose} className={'min-w-32'}>
            {t('common.ok')}
          </Button>
        </div>
      </div>
    </div>
  );
};
