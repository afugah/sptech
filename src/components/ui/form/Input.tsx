import classNames from 'classnames';
import React, { useState } from 'react';
import { InputContainer, InputLabel, StyledInput } from './Input.styled';

interface IInputProps {
  name?: string;
  label?: string;
  type: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;

  className?: string;
}

/**
 * @deprecated Use Input from /src/components/ui/Input
 */
const Input: React.FC<IInputProps> = React.forwardRef<HTMLInputElement, IInputProps>((props, ref) => {
  const { name, type, label, defaultValue, disabled = false, value, className, ...restProps } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <InputContainer className={className}>
      {label && (
        <InputLabel $isFocused={isFocused || !!defaultValue} htmlFor={name}>
          {label}
        </InputLabel>
      )}

      <StyledInput
        className={classNames({ '!pt-0': !label })}
        ref={ref}
        id={name}
        name={name}
        type={type}
        disabled={disabled}
        {...restProps}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={(e) => {
          if (!e.target.value.length) setIsFocused(false);
        }}
        onInput={() => {
          setIsFocused(true);
        }}
        defaultValue={defaultValue}
        value={value}
      />
    </InputContainer>
  );
});

Input.displayName = 'Input';
export default Input;
