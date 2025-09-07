interface IProductInfoMeasurementsProps {
  data: Array<[string, { value: string | Record<string, string> | undefined; unit: string }]>;
}

export const ProductInfoMeasurements: React.FC<IProductInfoMeasurementsProps> = ({ data }) => {
  return (
    <div className={'flex flex-col gap-2 text-xs'}>
      {data.map(([title, item]) => (
        <div key={title}>
          <div className={'pb-1'}>{title}</div>
          <div>
            {typeof item.value === 'object'
              ? Object.entries(item.value).map(([key, value]) => {
                  if (!key || !value) return null;
                  return (
                    <span key={key} className={'mr-2'}>
                      <span className={'pr-0.5'}>{key}: </span>
                      <span className={'text-gray-800'}>
                        {value}
                        {item.unit}
                      </span>
                    </span>
                  );
                })
              : item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
