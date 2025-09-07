import classNames from 'classnames';
import React from 'react';

interface ICategoryPageDescriptionProps {
  description: string | undefined;
  subtitle: string | undefined;
}

export const CategoryPageDescription: React.FC<ICategoryPageDescriptionProps> = (props) => {
  const { description, subtitle } = props;

  if (!description) return null;

  return (
    <div className={'mx-auto mt-2 text-center'}>
      {subtitle && <h2 className={'text-center'}>{subtitle}</h2>}

      <p className={classNames('m-0 max-w-xl overflow-hidden overflow-ellipsis whitespace-normal text-lg')}>
        {description}
      </p>
    </div>
  );
};
