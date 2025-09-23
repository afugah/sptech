import GiftCardIcon from '@images/icons/gift-card.svg';
import CloseIcon from '@images/icons/xmark.svg';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { CollapseRounded } from '@/src/components/ui/CollapseRounded';
import { Input, InputVariantEnum } from '@/src/components/ui/Input';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { getAmount } from '@/src/helpers/money';
import { type IRetain24 } from '@/src/types/api/gift-cards';
import translateGiftCardError from './GiftCardErrorTranslation';

const CheckoutGiftCards: React.FC = () => {
  const t = useTranslations();
  const { cart } = useCart();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [giftCardError, setGiftCardError] = useState<string | undefined>(undefined);
  const { addRetain24GiftCard, checkout, deleteRetain24GiftCard } = useCheckout();

  const { register, handleSubmit, reset, watch } = useForm<IRetain24.GiftCartUseRequest>();
  const giftCards = checkout?.giftCards;
  const formFields = watch();
  const isValid = formFields?.id !== '' && formFields?.pin !== '';

  const onClickRemove = (id: string) => {
    setIsLoading(true);
    deleteRetain24GiftCard(id)
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const onSubmit: SubmitHandler<IRetain24.GiftCartUseRequest> = async (data) => {
    setIsLoading(true);
    const { id, pin } = data;
    await addRetain24GiftCard({ id, pin })
      .then(() => {
        reset({
          id: '',
          pin: '',
        });
        setGiftCardError(undefined);
        setIsLoading(false);
      })
      .catch((error) => {
        setGiftCardError(error instanceof Error ? error.message : error);
        setIsLoading(false);
      });
  };

  return (
    <CollapseRounded
      title={t('cart.add-gift-card')}
      buttonClassName={'!justify-start'}
      titleClassName={'uppercase text-sm'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={'mt-4 flex gap-x-5'}>
        <Input
          inputVariant={InputVariantEnum.Underline}
          type={'text'}
          label={t('cart.pin-code')}
          {...register('pin', { required: true })}
          name={'pin'}
          className={'max-w-20'}
        />
        <Input
          inputVariant={InputVariantEnum.Underline}
          {...register('id', { required: true })}
          name={'id'}
          label={t('cart.gift-card-code')}
          type={'text'}
          className={'max-w-96'}
          suffix={
            <button className={'ml-4 text-sm uppercase'} disabled={!isValid || isLoading} type={'submit'}>
              {t('cart.apply')}
            </button>
          }
        />
      </form>

      {!!giftCardError && (
        <div className={'text-input-error mt-2 flex items-center gap-x-2 text-sm'}>
          {translateGiftCardError(giftCardError) ?? ''}
        </div>
      )}

      {giftCards && giftCards.length > 0 && (
        <ul className={`transition-margin mt-3 duration-300 ease-out`}>
          {giftCards?.map((giftCard) => (
            <li
              key={giftCard.id}
              className={
                'mb-2 flex w-full items-center justify-between rounded-lg border border-gray-300 p-2.5 text-sm last:mb-0'
              }
            >
              <div className={'flex items-center gap-4'}>
                <GiftCardIcon className={'h-5 w-5'} />{' '}
                <span className={''}>{getAmount(giftCard.amount, cart?.currencyCode ?? '')}</span>
                <span className={'text-sm text-gray-500'}>( {giftCard.id} )</span>
              </div>
              <CloseIcon className={'h-5 w-5 cursor-pointer'} onClick={() => onClickRemove(giftCard.id)} />
            </li>
          ))}
        </ul>
      )}
    </CollapseRounded>
  );
};
export default CheckoutGiftCards;
