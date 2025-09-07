import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn/button';
import { Link } from '@/src/i18n/navigation';

interface CheckoutButtonProps {
  onClose: () => void;
}

export const CheckoutButton = ({ onClose }: CheckoutButtonProps) => {
  const t = useTranslations();

  return (
    <Link href={'/checkout'} className={'px-3 xs:px-8 lg:px-12'} tabIndex={0}>
      <Button onClick={onClose} className={'w-full uppercase'} variant={'default'} size={'lg'}>
        {t('cart.to-checkout')}
      </Button>
    </Link>
  );
};
