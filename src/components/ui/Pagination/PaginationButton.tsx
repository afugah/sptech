import classNames from 'classnames';
import { Link } from '@/src/i18n/navigation';

interface IPaginationButtonProps {
  page: string | number;
  active: boolean;
  onClick: (page: number) => void;
  href?: string;
}

export const PaginationButton: React.FC<IPaginationButtonProps> = ({ page, active = false, onClick, href }) => {
  const className = 'box-content flex justify-center rounded-full transition-colors max-w-[10px]';
  const hoverClassName = 'hover:bg-black hover:text-white';

  if (typeof page === 'string') return <div className={classNames(className, 'flex h-[42px] items-end')}>{page}</div>;

  if (active)
    return (
      <div
        className={classNames(className, 'items-center border border-black bg-black px-4 py-2 font-medium text-white')}
      >
        {page}
      </div>
    );

  return (
    <Link
      href={href || '#'}
      onClick={(e) => {
        e.preventDefault();
        onClick(page - 1);
      }}
      className={classNames(className, hoverClassName, 'items-center border border-black px-4 py-2')}
    >
      {page}
    </Link>
  );
};
