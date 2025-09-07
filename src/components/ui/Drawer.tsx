'use client';

import CloseIcon from '@images/icons/close.svg';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';

interface IDrawerProps {
  children?: React.ReactNode;
  header?: (closeButton: React.ReactNode) => React.ReactNode;
  open: boolean;

  title?: string;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;

  className?: string;
  bodyClassName?: string;
  onClose: () => void;
}

export const Drawer: React.FC<IDrawerProps> = ({
  children,
  header,
  open,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  className,
  onClose,
  bodyClassName,
}) => {
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const closeButton = useMemo(
    () => (
      <div className={'sticky left-0 right-0 top-0 z-50 flex w-full flex-row justify-end p-5'}>
        <button tabIndex={open ? 0 : -1} onClick={onClose} aria-label={'Close Drawer'}>
          <CloseIcon />
        </button>
      </div>
    ),
    [onClose, open],
  );

  return (
    <div
      className={classNames('fixed inset-0 z-50 flex justify-end', {
        'pointer-events-auto': open,
        'pointer-events-none': !open,
      })}
    >
      {/* Backdrop */}
      <div
        className={classNames('absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out', {
          'opacity-100': open,
          'opacity-0': !open,
        })}
        onClick={onClose}
        aria-hidden={'true'}
      />

      <div
        className={classNames(
          'absolute z-40 flex h-full w-full max-w-[522px] transform flex-col overflow-y-auto bg-alabaster transition-transform duration-300 ease-in-out',
          {
            'translate-x-0': open,
            'translate-x-full': !open,
          },
          className,
        )}
      >
        {header ? header(closeButton) : closeButton}

        <div className={classNames('mb-10 flex w-full flex-col', bodyClassName)}>
          {(!!title || !!subtitle) && (
            <div className={'flex flex-col gap-4 px-8 lg:px-14'}>
              {title && <h4 className={'text-2xl ' + titleClassName}>{title}</h4>}
              {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
