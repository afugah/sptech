import classNames from 'classnames';

interface IProductInfoTabProps<T> {
  id: string;

  title: string;
  data: T;
  children: (data: T) => React.ReactNode;

  isActive?: boolean;
  onClick?: () => void;
}

export const ProductInfoTab = <T,>(props: IProductInfoTabProps<T>) => {
  const { title, isActive, onClick } = props;

  return (
    <div>
      <button
        onClick={onClick}
        className={classNames(
          '-mb-px border-b-2 p-4',
          isActive ? 'text-blue-600 border-blue-500' : 'border-transparent text-gray-600',
        )}
      >
        {title}
      </button>
    </div>
  );
};
