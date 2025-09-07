interface IProductInfoDetailsProps {
  data: Array<[string, string | undefined]>;
}

export const ProductInfoDetails: React.FC<IProductInfoDetailsProps> = ({ data }) => {
  return (
    <div className={'flex flex-col gap-6'}>
      <ul className={'flex list-inside list-disc flex-col gap-1 text-xs'}>
        {data.map(([key, value]) => (
          <li key={key}>
            <span>{key}:</span>
            <span className={'pl-1 '}>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
