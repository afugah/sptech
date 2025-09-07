import classNames from 'classnames';
import { useToggle } from 'usehooks-ts';
import { MoreLessIcon } from '@/src/components/ui/icons/MoreLessIcon';

interface ICollapseRoundedProps {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;

  className?: string;
  buttonClassName?: string;
  titleClassName?: string;
}

export const CollapseRounded: React.FC<ICollapseRoundedProps> = ({
  title,
  children,
  disabled = false,
  className,
  buttonClassName,
  titleClassName,
}) => {
  const [isOpen, toggleIsOpen] = useToggle(false);

  return (
    <div className={classNames({ 'opacity-75': disabled }, className)}>
      <button
        disabled={disabled}
        type={'button'}
        className={classNames(
          'flex w-full flex-row items-center justify-between text-right text-secondary-800',
          buttonClassName,
        )}
        onClick={toggleIsOpen}
      >
        <p className={classNames('mr-4', titleClassName)}>{title}</p>

        <MoreLessIcon isExpanded={isOpen} />
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
