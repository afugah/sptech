'use client';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useUser } from '@/src/context/authContext';
import { Link, usePathname } from '@/src/i18n/navigation';
import { Button } from '../../ui/Button';

const ProfileHeader = () => {
  const pathname = usePathname();
  const { signOut } = useUser();
  const isActive = (path: string) => pathname.endsWith(path);
  const t = useTranslations();

  return (
    <div className={'bg-seashell'}>
      <div className={'container relative flex flex-row flex-wrap justify-center gap-x-8 gap-y-4 bg-seashell p-8'}>
        <Link href={'/profile'} passHref>
          <Button
            className={classNames('border-none', {
              'bg-black': isActive('/profile'),
              'bg-white': !isActive('/profile'),
            })}
            buttonType={isActive('/profile') ? Button.Type.Filled : Button.Type.Outline}
            buttonColor={Button.Color.Dark}
            buttonSize={Button.Size.Small}
          >
            {t('member.overview')}
          </Button>
        </Link>

        <Link href={'/profile/order-history'} passHref>
          <Button
            className={classNames('border-none', {
              'bg-black': isActive('/profile/order-history'),
              'bg-white': !isActive('/profile/order-history'),
            })}
            buttonType={isActive('/profile/order-history') ? Button.Type.Filled : Button.Type.Outline}
            buttonColor={Button.Color.Dark}
            buttonSize={Button.Size.Small}
          >
            {t('member.order-history')}
          </Button>
        </Link>

        <Link href={'/profile/settings'} passHref>
          <Button
            className={classNames('border-none', {
              'bg-black': isActive('/profile/settings'),
              'bg-white': !isActive('/profile/settings'),
            })}
            buttonType={isActive('/profile/settings') ? Button.Type.Filled : Button.Type.Outline}
            buttonColor={Button.Color.Dark}
            buttonSize={Button.Size.Small}
          >
            {t('member.settings')}
          </Button>
        </Link>

        <Button
          onClick={() => {
            signOut();
          }}
          className={classNames('absolute right-0 border-gray bg-transparent text-black max-md:relative')}
          buttonType={Button.Type.Outline}
          buttonSize={Button.Size.Small}
        >
          {t('member.sing-out')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
