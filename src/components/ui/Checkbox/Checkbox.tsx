import ErrorIcon from '@images/icons/error.svg';
import React, { type ChangeEventHandler } from 'react';

interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;

  checked?: boolean;
  handleOnChange?: ChangeEventHandler<HTMLInputElement>;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, IProps>(
  ({ label, checked, handleOnChange, error, ...props }, ref) => {
    const errorList = error ? (Array.isArray(error) ? error : [error]) : [];

    return (
      <div>
        <label className={'flex cursor-pointer items-center gap-2'}>
          <input
            ref={ref}
            type={'checkbox'}
            checked={checked}
            className={'text-blue-600 form-checkbox peer/checkbox h-4 w-4 opacity-0'}
            {...props}
            onChange={(e) => {
              handleOnChange?.(e);
              props.onChange?.(e);
            }}
          />
          <svg
            viewBox={'0 0 16 16'}
            className={'absolute h-4 w-4 text-gray-600 peer-checked/checkbox:[&>path]:!opacity-100'}
            fill={'none'}
            xmlns={'http://www.w3.org/2000/svg'}
          >
            <circle cx={'8'} cy={'8'} r={'7.5'} stroke={'currentColor'} strokeWidth={'1'} fill={'none'} />
            <path
              stroke={'currentColor'}
              strokeLinecap={'round'}
              strokeLinejoin={'round'}
              d={'M10.683 5.317l-5.366 5.366M10.683 10.683L5.317 5.317'}
              className={`opacity-0 transition-opacity duration-200`}
            />
          </svg>

          <div className={'pr-1 text-sm text-black'}>{label}</div>
        </label>

        {errorList.map((error) => (
          <p key={error} className={'text-input-error mt-2 flex items-center gap-x-2 text-sm'}>
            {error}
            <ErrorIcon className={'fill-input-error'} />
          </p>
        ))}
      </div>
    );
  },
);

export default Checkbox;
Checkbox.displayName = 'Checkbox';
