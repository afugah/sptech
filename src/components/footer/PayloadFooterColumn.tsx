import { PayloadFooterLink } from '@/src/components/footer/PayloadFooterLink';
import { type IFooterColumn } from '@/src/lib/framework/Footer/domain/entities/IFooter';

interface IPayloadFooterColumnProps {
  column: IFooterColumn;
}

export const PayloadFooterColumn: React.FC<IPayloadFooterColumnProps> = ({ column }) => {
  return (
    <div className={'mt-5 flex h-full flex-col'}>
      <div className={'mb-4 flex justify-center lg:justify-start'}>
        {column.columnTitle && <h3 className={'text-xl font-light uppercase tracking-widest'}>{column.columnTitle}</h3>}
      </div>

      <div>
        <ul className={'space-y-3 font-light'}>
          {column.links.map((footerLink) => (
            <li key={footerLink.id}>
              <PayloadFooterLink footerLink={footerLink} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
