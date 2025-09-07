'use client';

import Icon from '@images/icons/add_black.svg';
import classNames from 'classnames';
import { useState } from 'react';

interface ICollapseProps {
  title: string;
  children: React.ReactNode;
}

export const Collapse: React.FC<ICollapseProps> = (props) => {
  const { title, children } = props;

  const [isOpen, setIsOpen] = useState(false);
  const onOpenToggle = () => setIsOpen((state) => !state);

  return (
    <div className={'border-t border-gray-400 [&:last-child]:border-b'}>
      <button className={'w-full py-6 text-left'} onClick={onOpenToggle}>
        <div className={'flex flex-row items-center justify-between'}>
          <p>{title}</p>

          <Icon className={classNames('transition-transform duration-300', { 'rotate-135': isOpen })} />
        </div>
      </button>

      {!!isOpen && <div className={'pb-6'}>{children}</div>}
    </div>
  );
};
