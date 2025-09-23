'use client';

import ErrorIcon from '@images/icons/error.svg';
import EyeIcon from '@images/icons/eye.svg';
import classNames from 'classnames';
import React, { useState } from 'react';
import { InputStateEnum, InputVariantEnum } from '@/src/components/ui/Input/constants';

const inputVariants: Record<InputVariantEnum, Record<InputStateEnum, string>> = {
  [InputVariantEnum.Underline]: {
    [InputStateEnum.Default]: 'border-black border-b pb-0 bg-transparent text-black',
    [InputStateEnum.Error]: 'border-input-error pb-0 border-b bg-transparent text-red-500 bg-white',
    [InputStateEnum.Disabled]: 'border-gray pb-0 opacity-50 border-b bg-transparent text-gray-400 cursor-not-allowed',
  },
  [InputVariantEnum.Default]: {
    [InputStateEnum.Default]: 'border-input-border text-input-default rounded-md border',
    [InputStateEnum.Error]: 'border-input-error text-red-500 rounded-md border',
    [InputStateEnum.Disabled]:
      'bg-gray-300 opacity-50 border-input-border text-gray-400 cursor-not-allowed rounded-md border',
  },
  [InputVariantEnum.Normal]: {
    [InputStateEnum.Default]: ` border-b border-gray-700 pb-0 bg-transparent text-black `,
    [InputStateEnum.Error]: 'border-input-error text-red-500 rounded-md border',
    [InputStateEnum.Disabled]:
      'bg-gray-300 opacity-50 border-input-border text-gray-400 cursor-not-allowed rounded-md border',
  },
};

interface IInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string | string[];
  icon?: React.ReactNode;
  inputVariant?: InputVariantEnum;
  hideRequired?: boolean;
  suffix?: React.ReactNode;
  inputClassName?: string;
  labelClassName?: string;
  uncontrolled?: boolean;
  className?: string;
}

const InputImpl: React.FC<IInputProps> = React.forwardRef<HTMLInputElement, IInputProps>((props, ref) => {
  const {
    label,
    value,
    type = 'text',
    error,
    inputVariant = InputVariantEnum.Default,
    icon,
    disabled,
    required,
    hideRequired = false,
    suffix,
    uncontrolled = false,
    className,
    inputClassName,
    labelClassName,
    ...restProps
  } = props;
  const [inputType, setInputType] = useState(type);
  const [isFocused, setIsFocused] = useState(false);
  const [innerValue, setInnerValue] = useState(value || '');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e);
    setInnerValue(e.target.value);
  };
  const errorList = error ? (Array.isArray(error) ? error : [error]) : [];

  const localLabelClassName = classNames(
    'relative flex pt-0 pr-3 pb-0 pl-3  h-12 text-sm text-gray-600',
    label === 'State' || label === 'Last name' ? 'border-l' : '',
    label === 'Mobile phone' ? 'border-b-0' : '',
    {
      [inputVariants[inputVariant][InputStateEnum.Default]]: !disabled && !error,
      [inputVariants[inputVariant][InputStateEnum.Error]]: !!error,
      [inputVariants[inputVariant][InputStateEnum.Disabled]]: disabled,
    },
    labelClassName,
  );

  const inputClassNames = classNames(
    'w-full focus:outline-none font-sans text-black font-medium text-lg h-full transition-colors duration-300 ease-in-out bg-transparent border p-0 m-0',

    { 'pr-10': !!icon, 'cursor-not-allowed': disabled, 'text-black': inputVariant === InputVariantEnum.Underline },
    inputClassName,
  );

  return (
    <div className={classNames('w-full', className)}>
      <label className={localLabelClassName}>
        <span
          className={`absolute left-2.5 translate-y-[20%]  transition-all duration-300 ease-in-out ${
            isFocused || type === 'date' || type === 'datetime-local' || innerValue
              ? '-top-1 text-sm font-medium text-gray-800 '
              : 'top-3 text-sm font-medium text-gray-800 '
          }`}
        >
          {label}
          {!!required && !hideRequired && '* '}
        </span>

        <input
          ref={ref}
          {...restProps}
          onFocus={(e) => {
            restProps.onFocus?.(e);
            setIsFocused(true);
          }}
          onBlur={(e) => {
            restProps.onBlur?.(e);
            setIsFocused(false);
          }}
          value={uncontrolled ? undefined : innerValue}
          onChange={onChange}
          type={inputType}
          disabled={disabled}
          className={inputClassNames}
        />
        {icon && <span className={'absolute inset-y-0 right-0 flex items-center pr-3'}>{icon}</span>}

        {type === 'password' && (
          <span className={'absolute inset-y-0 right-0 flex items-center pr-3'}>
            <EyeIcon onClick={() => setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'))} />
          </span>
        )}

        {suffix}
      </label>

      {errorList.map((error) => (
        <p key={error} className={'text-input-error mt-2 flex items-center gap-x-2 text-sm'}>
          {error}
          <ErrorIcon className={'fill-input-error'} />
        </p>
      ))}
    </div>
  );
});

InputImpl.displayName = 'InputImpl';
export default InputImpl;
