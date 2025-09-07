import MenuArrowDown from '@images/icons/menu-arrow-down.svg';
import classNames from 'classnames';

interface ICollapseMenuProps {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const CollapseMenu: React.FC<ICollapseMenuProps> = ({ title, children, disabled = false, isOpen, onToggle }) => {
  return (
    <div className={classNames({ 'opacity-75': disabled })}>
      <button
        disabled={disabled}
        type={'button'}
        className={classNames(
          'group flex w-full flex-row items-center justify-between text-left transition-colors duration-300 hover:text-gray-900',
        )}
        onClick={onToggle}
      >
        <p className={classNames('uppercase')}>{title}</p>

        <span className={'ml-4'}>
          <MenuArrowDown
            className={
              'my-auto hidden transform transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-y-2 lg:group-hover:opacity-100'
            }
          />
        </span>
      </button>

      <div
        className={classNames('grid transition-[opacity,grid-template-rows] duration-300', {
          'active grid-rows-[1fr] opacity-100': isOpen,
          'grid-rows-[0fr] opacity-0': !isOpen,
        })}
      >
        <div className={'overflow-hidden'}>{children}</div>
      </div>
    </div>
  );
};
