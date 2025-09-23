import React, { type ChangeEventHandler, type FocusEventHandler, type InputHTMLAttributes, useState } from 'react';

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  placeholder?: string;
  labelUppercase?: boolean;
  defaultFocused?: boolean;
}

// TODO: Is this a Checkbox? Move to a different folder lol
const FloatingLabelInput: React.FC<IProps> = React.forwardRef<HTMLInputElement, IProps>((props, ref) => {
  const {
    label,
    value,
    defaultValue,
    onChange,
    required = false,
    placeholder = '',
    defaultFocused = false,
    labelUppercase = false,
    ...restProps
  } = props;
  const [isFocused, setIsFocused] = useState(defaultFocused);

  const handleFocus: FocusEventHandler<HTMLInputElement> = () => setIsFocused(true);
  const handleBlur: FocusEventHandler<HTMLInputElement> = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.length) setIsFocused(false);
  };

  return (
    <div className={'relative'}>
      <label className={'block text-gray-600'}>
        <span
          className={`absolute left-0 transition-all duration-200 ease-in-out ${
            isFocused || value ? 'top-[-20px] text-sm text-black opacity-50' : 'top-[-5px] text-base text-gray-500'
          } ${labelUppercase ? 'uppercase' : ''}`}
        >
          {label}
          {required && '* '}
          {!props.value && !isFocused && defaultValue ? <span className={'text-gray'}>{placeholder}</span> : <></>}
        </span>
        <input
          ref={ref}
          type={'text'}
          value={value}
          onChange={onChange}
          required={required}
          className={
            'block h-[22px] w-full rounded-none border-none border-gray-400 bg-[#f5ebe3] bg-transparent p-0 hover:border-none focus:border-none focus:outline-none'
          }
          {...restProps}
          onFocus={(e) => {
            handleFocus(e);
            restProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            handleBlur(e);
            restProps.onBlur?.(e);
          }}
        />
        <div className={'h-[1px] bg-black'} />
      </label>
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';
export default FloatingLabelInput;
