import CheckIcon from '@images/icons/check-green.svg';
import classNames from 'classnames';
import React from 'react';

interface ISuccessMessage {
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export const SuccessMessage: React.FC<ISuccessMessage> = (props) => {
  const { children, className, iconClassName } = props;

  return (
    <div
      className={classNames(
        'text-green-500 flex items-center justify-center rounded-lg border border-green bg-backgroundAlternative p-2 text-xs',
        className,
      )}
    >
      <CheckIcon width={'16px'} height={'16px'} className={classNames('mr-2 h-4 w-4', iconClassName)} /> {children}
    </div>
  );
};
