import { SafeHTML } from '@/src/components/ui/SafeHTML';

interface IProductInfoDetailsProps {
  data: Array<[string, string | undefined]>;
}

export const ProductInfoDetails: React.FC<IProductInfoDetailsProps> = ({ data }) => {
  return (
    <div className={'flex flex-col gap-6'}>
      {data.map(([key, value]) => (
        <div className={'w-full pl-1'} key={key}>
          {value ? (
            <SafeHTML html={value} className={'space-y-2 [&_p:last-child]:mb-0 [&_p]:mb-2 [&_p]:block'} />
          ) : null}
        </div>
      ))}
    </div>
  );
};
