import ChevronDownIcon from '@images/icons/chevron-down.svg';
import GiftCardIcon from '@images/icons/gift-card.svg';
import React, { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import translateGiftCardError from '@/src/components/checkout/GiftCardErrorTranslation';
import { Retain24GiftCard } from '@/src/components/checkout/Retain24/GiftCard';
import { Button } from '@/src/components/ui/Button';
import Loader from '@/src/components/ui/Loader';
import { useCheckout } from '@/src/context/checkoutContext';
import { type IRetain24 } from '@/src/types/api/gift-cards';
import sharedStyles from '../Shared.module.css';
import styles from './GiftCard.module.css';

/**
 * @deprecated Will be removed
 */
export default function GiftCardForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState(false);
  const [giftCardError, setGiftCardError] = useState<string | undefined>(undefined);
  const { addRetain24GiftCard, checkout } = useCheckout();

  const { register, handleSubmit, reset, watch } = useForm<IRetain24.GiftCartUseRequest>();

  const giftCards = checkout?.giftCards;

  const onSubmit: SubmitHandler<IRetain24.GiftCartUseRequest> = async (data) => {
    setIsLoading(true);
    const { id, pin } = data;
    await addRetain24GiftCard({ id, pin })
      .then(() => {
        reset();
        setExpanded(false);
        setGiftCardError(undefined);
        setIsLoading(false);
      })
      .catch((error) => {
        setGiftCardError(error.message);
        setIsLoading(false);
      });
  };

  const formFields = watch();
  const isValid = formFields?.id !== '' && formFields?.pin !== '';

  return (
    <div className={styles.giftCardContainer}>
      {isLoading && <Loader overlay={'rgba(255, 255, 255, 0.8)'} inverted />}
      <div className={sharedStyles.checkoutTab} onClick={() => setExpanded(!expanded)}>
        <span>
          <GiftCardIcon />
          Use Gift card
        </span>

        <div className={cn(styles.arrowWrapper, expanded && styles.expanded)}>
          <ChevronDownIcon />
        </div>
      </div>

      <div className={cn(styles.inputWrapper, expanded && styles.expanded)}>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('id', { required: true })} name={'id'} type={'text'} placeholder={'Card ID'} />
            <input {...register('pin', { required: true })} name={'pin'} type={'text'} placeholder={'Pin'} />
            <Button disabled={!isValid} type={'submit'}>
              Add
            </Button>
          </form>
        </div>
        {giftCardError && <p className={styles.errorMessage}>{translateGiftCardError(giftCardError) ?? ''}</p>}
      </div>

      {giftCards && giftCards.length > 0 && (
        <ul className={cn(styles.appliedGiftCards, expanded && styles.expanded)}>
          {giftCards?.map((giftCard) => (
            <Retain24GiftCard key={giftCard.id} giftCard={giftCard} setIsLoading={setIsLoading} />
          ))}
        </ul>
      )}
    </div>
  );
}
