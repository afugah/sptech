import Image from 'next/image';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

interface IAvailabilityInStoreCard {
  product: IProduct;
  selectedVariantSku: string | undefined;
  selectedVariantByUser: string | undefined;
  setSelectedVariantSku: React.Dispatch<React.SetStateAction<string>>;
  setSelectedVariantByUser: React.Dispatch<React.SetStateAction<string>>;
}

export const AvailabilityInStoreCard: React.FC<IAvailabilityInStoreCard> = ({ product }) => {
  const { title, images, display_name } = product;
  return (
    <div className={'flex items-center gap-x-5'}>
      <Image src={images[0]?.src} width={100} height={146} alt={title} />
      <div className={'flex flex-col gap-y-2 text-xs'}>
        <div className={'flex flex-col justify-between'}>
          <div className={'font-sans text-xs uppercase text-secondary'}>{title.split(' ')[0]}</div>
          <span className={'font-serif text-xl'}>{display_name}</span>
        </div>
      </div>
    </div>
  );
};
