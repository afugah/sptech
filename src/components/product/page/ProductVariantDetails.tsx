import classNames from 'classnames';
import React from 'react';

interface IProductVariantDetailsProps {
  details: Record<string, string | undefined>;

  className?: string;
}

/**
 * @deprecated Unused. Required refactoring
 */
export const ProductVariantDetails: React.FC<IProductVariantDetailsProps> = (props) => {
  const { details = [], className } = props;

  const filteredDetails = Object.entries(details).filter(([key, value]) => !!key && !!value);
  if (!filteredDetails.length) return null;

  return (
    <div className={classNames('mx-2 my-2 grid grid-cols-2 flex-wrap gap-x-4 leading-tight', className)}>
      {filteredDetails.map(([key, value]) => (
        <React.Fragment key={key}>
          <span className={'font-bold'}>{key}: </span>
          <span className={'text-end'}>{value}</span>
        </React.Fragment>
      ))}
      <div></div>
    </div>
  );
};
