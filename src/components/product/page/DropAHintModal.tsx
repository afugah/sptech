import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { Button } from '../../ui/Button';
import FloatingLabelInput from '../../ui/Checkbox/Input';
import ProductModal from './ProductModal';

interface DropAHintModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  product: IProduct;
}

interface IForm {
  recipientName: string;
  recipientEmail: string;
  yourName: string;
  yourEmail: string;
}

const DropAHintModal: React.FC<DropAHintModalProps> = ({ isVisible, setIsVisible, product }) => {
  const t = useTranslations('common');
  const { images } = product;
  const { register, handleSubmit } = useForm<IForm>();

  const image = images?.[0];

  const onSubmit = () => {
    setIsVisible(false);
  };

  return (
    <ProductModal isVisible={isVisible} showHeader={false} setIsVisible={setIsVisible}>
      <div className={'mb-6 px-14'}>
        {image && <Image src={image.src} alt={image.alt} width={200} height={200} className={'mx-auto mb-4'} />}

        <h2 className={'mb-8 text-2xl font-bold'}>Drop a Hint</h2>

        <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-10'}>
          <FloatingLabelInput
            {...register('recipientName', { required: false })}
            label={t('recipient-name')}
            labelUppercase
            type={'text'}
            autoComplete={'name'}
          />

          <FloatingLabelInput
            {...register('recipientEmail', { required: false })}
            label={t('recipient-email')}
            labelUppercase
            type={'email'}
            autoComplete={'email'}
          />

          <FloatingLabelInput
            {...register('yourName', { required: false })}
            label={t('your-name')}
            labelUppercase
            type={'text'}
            autoComplete={'name'}
          />

          <FloatingLabelInput
            {...register('yourEmail', { required: false })}
            label={t('your-email')}
            labelUppercase
            type={'email'}
            autoComplete={'email'}
          />

          <Button type={'submit'} className={''} buttonType={Button.Type.Filled} buttonColor={Button.Color.Dark}>
            {t('send')}
          </Button>
        </form>
      </div>
    </ProductModal>
  );
};

export default DropAHintModal;
