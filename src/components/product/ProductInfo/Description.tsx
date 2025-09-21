import { SafeHTML } from '@/src/components/ui/SafeHTML';

interface IProductInfoDescriptionProps {
  description: string;
}

export const ProductInfoDescription: React.FC<IProductInfoDescriptionProps> = ({ description }) => {
  if (!description) return <p className={''}></p>;

  return (
    <div className={''}>
      <SafeHTML html={description} tag={'p'} className={'whitespace-pre-wrap'} />
    </div>
  );
};
