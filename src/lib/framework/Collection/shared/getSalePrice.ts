export const getSalePrice = (regular_price: number = 0, sale_price: number | null | undefined) => {
  if (sale_price === null || sale_price === undefined || sale_price === regular_price) return null;

  return sale_price;
};
