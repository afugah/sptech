import classNames from 'classnames';

interface IData {
  size: string;
  stockQuantity: number;
  isAvailable: boolean;
}
interface IStockAvailability {
  data: IData[];
  title: string;
  className: string;
  displaySize?: boolean;
}

export const StockAvailability: React.FC<IStockAvailability> = ({ className, title, data, displaySize }) => {
  return (
    !!data.length && (
      <div className={'flex items-center gap-x-2.5 text-xs'}>
        <div className={classNames('h-[10px] w-[10px] rounded-lg', className)} />
        <span className={'text-xs text-gray-800'}>{title}</span>
        <div className={'flex gap-x-2'}>
          {data.map((i, j) => (
            <span key={j}>{displaySize ? i.size : ''}</span>
          ))}
        </div>
      </div>
    )
  );
};
