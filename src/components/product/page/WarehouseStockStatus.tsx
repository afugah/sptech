import LocationIcon from '@images/icons/location-dot.svg';
import React from 'react';
import { useCart } from '@/src/context/cartContext';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { StockDisplay } from './StockDisplay';
import { Container, Header, Store } from './WarehouseStockStatus.styled';

type Props = {
  variantStock: ICommerceStock | undefined;
};

const getWarehouseDetails = (id: string, countryCode: string) => {
  switch (id) {
    case 'b8757068-795b-441f-9104-df2fa219c8bb':
      switch (countryCode) {
        case 'SE':
          return {
            address: 'Vasagatan 10',
            city: 'Stockholm',
          };
        case 'FI':
          return {
            address: 'Paasivuorigatan 4',
            city: 'Helsinki',
          };
        case 'NO':
          return {
            address: 'Torggata 26',
            city: 'Oslo',
          };
        case 'DK':
          return {
            address: 'Rådhusstræde 13',
            city: 'Copenhagen',
          };
        case 'NL':
          return {
            address: 'Nieuwendijk 219',
            city: 'Amsterdam',
          };
      }
      break;
    case 'inventory-3':
      switch (countryCode) {
        case 'SE':
          return {
            address: 'Östra Larmgatan 16',
            city: 'Gothenburg',
          };
        case 'FI':
          return {
            address: 'Toimittajankuja',
            city: 'Vaasa',
          };
        case 'NO':
          return {
            address: 'Vestre Torggaten 3',
            city: 'Bergen',
          };
        case 'DK':
          return {
            address: 'Nørregade 71',
            city: 'Odense',
          };
        case 'NL':
          return {
            address: 'Mariniersweg 90',
            city: 'Rotterdam',
          };
      }
  }
};

/**
 * @deprecated This component is no longer used and will be removed.
 */
export const WarehouseStockStatus = ({ variantStock }: Props) => {
  const { store } = useCart();

  if (!variantStock) return null;

  return (
    <Container>
      <Header>
        <LocationIcon />
        <b>Store availability:</b>
      </Header>

      {variantStock.inventories.map((inventory) => {
        const { address, city } = getWarehouseDetails(inventory.id, store.countryCode) || {};
        if (!address || !city) return;

        return (
          <Store key={inventory.id}>
            <span>
              {address}, {city}
            </span>

            <StockDisplay stockQty={inventory.quantity} />
          </Store>
        );
      })}
    </Container>
  );
};
