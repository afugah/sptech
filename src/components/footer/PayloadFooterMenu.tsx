import { PayloadFooterColumn } from '@/src/components/footer/PayloadFooterColumn';
import { type IFooter } from '@/src/lib/framework/Footer/domain/entities/IFooter';

interface IPayloadFooterMenuProps {
  footerData: IFooter | null;
}

export const PayloadFooterMenu: React.FC<IPayloadFooterMenuProps> = ({ footerData }) => {
  if (!footerData?.columns?.length) return null;

  return (
    <div className={'flex w-full justify-center'}>
      <div className={'grid w-full max-w-6xl grid-cols-1 justify-items-center gap-8 lg:grid-cols-3 lg:gap-16'}>
        {footerData.columns.map((column) => (
          <div key={column.id} className={'max-w-xs'}>
            <PayloadFooterColumn column={column} />
          </div>
        ))}
      </div>
    </div>
  );
};
