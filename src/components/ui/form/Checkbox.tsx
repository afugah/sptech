import React, { type ChangeEventHandler } from 'react';
import { CheckboxContainer, CheckboxInput } from './Checkbox.styled';

type Props = {
  label: string;
  checked: boolean;
  handleOnChange: ChangeEventHandler<HTMLInputElement>;
};

const Checkbox = ({ label, checked, handleOnChange, ...props }: Props) => {
  return (
    <CheckboxContainer {...props}>
      <CheckboxInput type={'checkbox'} defaultChecked={checked} onChange={handleOnChange} />
      <p>{label}</p>
    </CheckboxContainer>
  );
};

export default Checkbox;
