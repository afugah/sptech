import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn/button';
import { Link } from '@/src/i18n/navigation';

interface CheckoutButtonProps {
  onClose: () => void;
}

export const CheckoutButton = ({ onClose }: CheckoutButtonProps) => {
  const t = useTranslations();

  return (
    <Link href={'/checkout'} className={' lg:px-0'} tabIndex={0}>
      <Button onClick={onClose} className={' w-full bg-gray-900 py-6 uppercase text-alabaster'} variant={'custom'}>
        {t('cart.to-checkout')}
      </Button>
    </Link>
  );
};
