import classNames from 'classnames';
import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

const Breadcrumbs = ({ children, className, ...props }: Props) => {
  return (
    <ul
      className={classNames(
        'mx-auto mb-2 mt-3 flex gap-2 text-xs [&>li:not(:last-child)]:after:ml-2 [&>li:not(:last-child)]:after:content-[">"]',
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
};

export default Breadcrumbs;
