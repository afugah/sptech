import classNames from 'classnames';
import React from 'react';

type Props = {
  inverted?: boolean;
  overlay?: string;
  className?: string;
};

const Loader = ({ inverted, overlay, className }: Props) => {
  const containerClasses = classNames(
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] p-2',
    { 'bg-transparent': overlay },
    className,
  );

  const elementClasses = classNames(
    'w-6 h-6 aspect-square border-2 border-solid border-white border-b-transparent rounded-full box-border animate-spin',
    { 'filter invert': inverted },
  );

  return (
    <div className={containerClasses} style={{ background: overlay }}>
      <div className={elementClasses} />
    </div>
  );
};

export default Loader;
