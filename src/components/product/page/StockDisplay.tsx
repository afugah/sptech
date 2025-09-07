import React from 'react';
import { Container, Indicator } from './StockDisplay.styled';

type Props = {
  stockQty: number | undefined;
  online?: boolean;
};

const getStockText = (stock: number | undefined) => {
  if (stock === undefined) return;
  if (stock <= 0) {
    return (
      <>
        <Indicator $status={'outOfStock'} />
        Out of stock
      </>
    );
  } else if (stock < 50) {
    return (
      <>
        <Indicator $status={'fewLeft'} />
        Few left in stock
      </>
    );
  } else {
    return (
      <>
        <Indicator $status={'inStock'} />
        In stock
      </>
    );
  }
};

export const StockDisplay = ({ stockQty, online }: Props) => (
  <Container>
    {getStockText(stockQty)} {online && 'online'}
  </Container>
);
