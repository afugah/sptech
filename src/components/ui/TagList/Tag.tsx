import classNames from 'classnames';
import React from 'react';
import { OptionalLink } from '@/src/components/ui/OptionalLink';

export type TagTemplate = 'round' | 'square' | string;

export interface ITagButtonProps {
  url?: string;
  children: string | React.ReactNode;
  template?: TagTemplate;

  onClick?: () => void;

  style?: React.CSSProperties;
  className?: string;
  lowStock?: boolean;
  lowStockNumber?: boolean;
}

// Template styles for different tag designs
const tagTemplates = {
  round: 'rounded-full',
  square: 'rounded-sm',
};

// Function to get template class based on template name
const getTemplateClass = (template: TagTemplate = 'round'): string => {
  return tagTemplates[template as keyof typeof tagTemplates] || tagTemplates.round;
};

export const Tag: React.FC<ITagButtonProps> = (props) => {
  const { url, children, onClick, style, className, lowStock, lowStockNumber, template = 'square' } = props;

  const templateClass = getTemplateClass(template);

  return (
    <OptionalLink href={url}>
      <div
        style={style}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        className={classNames(
          'max-h-12 min-w-72 cursor-pointer justify-center bg-[#444444] bg-opacity-50 p-4 text-center text-sm font-bold uppercase tracking-wide transition-colors hover:bg-opacity-70',
          templateClass,
          className,
        )}
      >
        {lowStock && (
          <div
            className={
              'absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-orange-600 text-sm text-white'
            }
          ></div>
        )}
        {lowStockNumber && (
          <div
            className={
              'absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-sm text-white'
            }
          ></div>
        )}
        {children}
      </div>
    </OptionalLink>
  );
};
