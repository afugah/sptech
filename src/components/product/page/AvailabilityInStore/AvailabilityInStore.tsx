'use client';

import { Drawer } from '@components/ui/Drawer';
import { Input } from '@components/ui/Input';
import Loader from '@components/ui/Loader';
import InfoIcon from '@images/icons/info.svg';
import SearchIcon from '@images/icons/search.svg';
import { useLocale, useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getMarketCode } from '@/src/util/locale';
import { AvailabilityInStoreCard } from './components/AvailabilityInStoreCard';
import { AvailableStock } from './components/Stock';
import { getAvailableStock, getStocksFromCommerceStock, getWarehouses } from './utils';

interface IAvailabilityInStore {
  product: IProduct;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const AvailabilityInStore: React.FC<IAvailabilityInStore> = (props) => {
  const t = useTranslations('product-page');

  const { product, isOpen, setIsOpen } = props;

  const { variants } = product;
  // const [showNearestStores] = useState(false);
  const [search, setSearch] = useState('');
  // const [nearestStores] = useState<string[]>([]);
  const [selectedVariantSku, setSelectedVariantSku] = useState('');
  const [selectedVariantByUser, setSelectedVariantByUser] = useState('');
  const [availableStocks, setAvailableStocks] = useState<ICommerceStock[]>([]);
  const [wareHouses, setWareHouses] = useState<IElasticSearch.WareHousesSuccessResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const marketCode = getMarketCode(locale!);
  const countryCode = marketCode.toUpperCase();
  const fetchAvailableStock = useCallback(async () => {
    try {
      const availableStocks = await getAvailableStock(product.brinkId, countryCode);
      setAvailableStocks(availableStocks);
    } catch (error) {
      console.error('Error fetching available stock:', error);
    }
  }, [countryCode, product.brinkId]);
  const fetchWarehouse = useCallback(async () => {
    try {
      const wareHouses = await getWarehouses();
      setWareHouses(wareHouses);
    } catch (error) {
      console.error('Error fetching warehouses stock:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      Promise.all([fetchAvailableStock(), fetchWarehouse()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [fetchAvailableStock, fetchWarehouse, isOpen]);

  // const selectedVariant = useMemo(() => {
  //   return variants.find((v) => v.sku === selectedVariantSku)?.variant || '';
  // }, [selectedVariantSku, variants]);

  // useEffect(() => {
  //   if (!isOpen) {
  //     setSelectedVariantSku('');
  //     setSelectedVariantByUser('');
  //   }
  // }, [isOpen]);

  // const onShowAllStock = () => {
  //   setSearch('');
  //   setSelectedVariantSku('');
  //   setSelectedVariantByUser('');
  // };
  const stocks = useMemo(
    () => getStocksFromCommerceStock(availableStocks, variants, wareHouses),
    [availableStocks, variants, wareHouses],
  );

  const onClose = () => setIsOpen(false);

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      className={'bg-white'}
      bodyClassName={'bg-white'}
      title={t('availability-in-store')}
    >
      <div className={'px-14'}>
        <AvailabilityInStoreCard
          selectedVariantSku={selectedVariantSku}
          setSelectedVariantSku={setSelectedVariantSku}
          selectedVariantByUser={selectedVariantByUser}
          setSelectedVariantByUser={setSelectedVariantByUser}
          product={product}
        />

        {/* <div className={'my-4 flex justify-between gap-8'}>
          <Button
            className={`hidden flex-1 ${showNearestStores ? 'bg-black text-white' : ''}`}
            // onClick={handleToggleNearestStores}
            buttonType={showNearestStores ? Button.Type.Filled : Button.Type.Outline}
            disabled={!nearestStores.length}
          >
            {t('close-to-me')} ({nearestStores.length})
          </Button>
          <Button
            className={`flex-1 ${!showNearestStores ? 'bg-black text-white' : ''}`}
            onClick={onShowAllStock}
            buttonType={!showNearestStores ? Button.Type.Filled : Button.Type.Outline}
          >
            {t('all-stores')} ({stocks.length})
          </Button>
        </div> */}

        <Input
          className={'my-4'}
          icon={<SearchIcon className={'text-gray'} />}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type={'text'}
          label={t('search-store')}
        />
        <div className={'mb-7 mt-5 flex items-center gap-x-2.5 bg-seashell p-5'}>
          <InfoIcon />
          <div className={'font-sans text-sm'}>{t('all-stock-balance-is-an-estimation')}</div>
        </div>
        {isLoading ? (
          <div className={'flex justify-center'}>
            <Loader inverted />
          </div>
        ) : stocks.length > 0 ? (
          <AvailableStock stocks={stocks} search={search} selectedVariant={selectedVariantByUser} />
        ) : null}
      </div>
    </Drawer>
  );
};

export default AvailabilityInStore;
