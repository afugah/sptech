import { Blur, Container } from '@components/ui/Popup.styled';
import React from 'react';

type Props = {
  children?: React.ReactNode;
};

export const Popup = ({ children }: Props) => {
  return (
    <>
      <Blur />
      <Container>{children}</Container>
    </>
  );
};
