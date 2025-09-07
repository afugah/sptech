import ArrowLeft from '@images/icons/arrow-left-long.svg';
import TagIcon from '@images/icons/badge.svg';
import TicketIcon from '@images/icons/ticket.svg';
import UserIcon from '@images/icons/user.svg';
import React, { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Button } from '@/src/components/ui/Button';
import Loader from '@/src/components/ui/Loader';
import { useCart } from '@/src/context/cartContext';
import { useVoyado } from '@/src/context/voyadoContext';

const AvailableOffers = () => {
  const [promotionRowError, setPromotionRowError] = useState<{ id: string; message: string }>({ id: '', message: '' });
  const [voucherRowError, setVoucherRowError] = useState<{ id: string; message: string }>({ id: '', message: '' });
  const { customer, addPromotion, addVoucher, startVoyado, deleteVoucher, isOffersOpen, setIsOffersOpen } = useVoyado();
  const { cart, cartProviders, vouchers } = useCart();
  const [loading, setLoading] = useState(false);

  const promotionList = customer?.promotions ?? [];
  const voucherList = customer?.vouchers?.items ?? [];

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'MISSING_DISCOUNT_EXTERNAL':
        return 'No discount found on promotion';
    }
    return error;
  };

  const updateSelectedPromotion = (selectedPromotion: string) => {
    setLoading(true);
    if (!cartProviders?.voyado?.additional?.contactId && customer) {
      startVoyado(customer.contactId)
        .then(() => addPromotion(selectedPromotion))
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setPromotionRowError({ id: selectedPromotion, message: error.message });
          setLoading(false);
        });
      return;
    }
    if (customer) {
      addPromotion(selectedPromotion)
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setPromotionRowError({ id: selectedPromotion, message: error.message });
          setLoading(false);
        });
      return;
    }
  };

  const updateSelectedVoucher = (selectedVoucherId: string, checkNumber: string) => {
    setLoading(true);
    if (cart?.discountExternals.length === 0 && !cartProviders?.voyado?.provider && customer) {
      startVoyado(customer.contactId)
        .then(() => addVoucher(checkNumber))
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setLoading(false);
          setVoucherRowError({ id: selectedVoucherId, message: error.message });
        });
      return;
    }
    if (vouchers[0]?.id === selectedVoucherId) {
      deleteVoucher(selectedVoucherId)
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setLoading(false);
          setVoucherRowError({ id: selectedVoucherId, message: error.message });
        });
      return;
    }
    if (vouchers && vouchers.length > 0 && customer) {
      deleteVoucher(vouchers[0]?.id)
        .then(() => addVoucher(checkNumber))
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setLoading(false);
          setVoucherRowError({ id: selectedVoucherId, message: error.message });
        });
      return;
    }
    if (cartProviders?.voyado?.provider && customer) {
      addVoucher(checkNumber)
        .then(() => {
          setLoading(false);
          setIsOffersOpen(false);
        })
        .catch((error) => {
          setLoading(false);
          setVoucherRowError({ id: selectedVoucherId, message: error.message });
        });
    }
  };

  return (
    <div
      className={`
    fixed bottom-0 right-0 top-0 z-[102] flex w-full max-w-[50rem] flex-col overflow-scroll bg-background px-[1.5rem] pb-[3rem] pt-0 transition-transform 
    ${isOffersOpen ? 'translate-x-0' : 'translate-x-[calc(100%+10rem)]'} 
    lg:bottom-[2rem] lg:right-[2rem] lg:top-[2rem] lg:px-[3rem] lg:pb-[3rem]
  `}
    >
      {loading && <Loader overlay={'rgba(250, 249, 248, 0.8)'} inverted />}
      <div className={'flex h-24 min-h-24 items-center justify-between border-b border-gray-200 lg:h-28 lg:min-h-28'}>
        <span className={'flex cursor-pointer items-center'} onClick={() => setIsOffersOpen(false)}>
          <div className={'mr-2.5 mt-0.5 h-7'}>
            <ArrowLeft className={'h-full'} />
          </div>{' '}
          Go back
        </span>
        {customer && (
          <span className={'flex items-center'}>
            <div className={'mr-2.5 mt-0.5 h-7'}>
              <UserIcon />
            </div>
            {customer?.firstName && customer.lastName
              ? `${customer.firstName} ${customer.lastName}`
              : `${customer.email}`}
          </span>
        )}
      </div>
      <Tabs>
        <TabList className={'mb-[2rem] flex border-b border-gray-300'}>
          <Tab
            className={'w-1/2 cursor-pointer text-center focus-visible:outline-none'}
            selectedClassName={'border-b-4 border-turquoise-dark border-solid w'}
          >
            <h3>Your promotions ({promotionList.length})</h3>
          </Tab>
          <Tab
            className={'w-1/2 cursor-pointer text-center focus-visible:outline-none'}
            selectedClassName={'border-b-4 border-turquoise-dark border-solid'}
          >
            <h3>Your vouchers ({voucherList.length})</h3>
          </Tab>
        </TabList>
        <TabPanel>
          {promotionList.length > 0 &&
            promotionList.map((promotion) => (
              <React.Fragment key={promotion.id}>
                <div
                  onClick={() => {
                    updateSelectedPromotion(promotion.id);
                  }}
                  className={`from-turquoise-500 to-turquoise-dark mb-6 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r p-4 font-bold text-white lg:mb-8 lg:px-6 lg:hover:cursor-pointer ${
                    cart?.discountExternals[0]?.reference ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className={'flex items-center'}>
                    <TagIcon className={'mr-6 h-11 fill-white lg:h-12'} />
                    {promotion.name}
                  </div>
                  <Button
                    buttonType={Button.Type.Outline}
                    className={'h-14 justify-self-end rounded-lg border-none bg-white/60 text-black'}
                  >
                    Apply
                  </Button>
                </div>
                {promotionRowError.id === promotion.id && (
                  <p className={'text-red-500'}>{getErrorMessage(promotionRowError?.message)}</p>
                )}
              </React.Fragment>
            ))}
          {promotionList.length === 0 && customer && (
            <div className={'text-center text-gray-500'}>No promotions found</div>
          )}
        </TabPanel>
        <TabPanel>
          {voucherList.length > 0 &&
            voucherList.map((voucher) => (
              <React.Fragment key={voucher.id}>
                <div className={'mb-4 flex items-center justify-between rounded-lg bg-secondary-200 p-4'}>
                  <div className={'flex items-center'}>
                    <div className={'w-[36px mr-[1rem]'}>
                      <TicketIcon />
                    </div>
                    <span className={'font-bold'}>{voucher.name}</span> - {voucher.value.amount}{' '}
                    {voucher.value.currency}
                  </div>
                  <Button onClick={() => updateSelectedVoucher(voucher.id, voucher.checkNumber)}>Apply</Button>
                </div>
                {voucherRowError.id === voucher.id && <p>{getErrorMessage(voucherRowError?.message)}</p>}
              </React.Fragment>
            ))}
          {voucherList.length === 0 && <div className={'text-center text-gray-500'}>No vouchers found</div>}
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AvailableOffers;
