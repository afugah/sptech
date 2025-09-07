'use client';

import { type IVoyado } from '@lib/framework/Voyado/types/IVoyado';
import { type VoyadoCustomer, type VoyadoVouchers } from '@lib/types/voyado';
import React, {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useCart } from '@/src/context/cartContext';
import { useIdentification } from '@/src/context/identificationContext';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import { getDisplayName } from '@/src/util/user';

export type VoyadoContext = {
  voyadoLoading: boolean;
  init: (email: string) => Promise<void>;
  removeCustomer: () => void;

  customer: VoyadoCustomer | null;

  customerOverview: IVoyado.ContactOverview | null;

  startVoyado: (contactId: string) => Promise<void>;

  addPromotion: (id: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  selectedPromotion: string | null;
  setSelectedPromotion: Dispatch<SetStateAction<string | null>>;

  refreshVouchers: () => void;
  redeemVoyadoVoucher: (
    contactId: string,
    bonusCheckId: string,
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  addVoucher: (id: string) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;

  isOffersOpen: boolean;
  setIsOffersOpen: Dispatch<SetStateAction<boolean>>;
};

const VoyadoContext = createContext<VoyadoContext>({} as VoyadoContext);

type PromotionProviderProps = {
  children: ReactNode;
};

const VoyadoProvider = ({ children }: PromotionProviderProps) => {
  const [customer, setCustomer] = useLocalStorage<VoyadoCustomer | null>('customer', null);
  const [customerOverview, setCustomerOverview] = useLocalStorage<IVoyado.ContactOverview | null>('customer', null);
  const [selectedPromotion, setSelectedPromotion] = useLocalStorage<string | null>('cartPromotion', null);

  const { cartToken, getSession } = useCart();
  const { identifyWithContact, removeContact } = useIdentification();

  const [isOffersOpen, setIsOffersOpen] = useState<boolean>(false);
  const [voyadoLoading, setVoyadoLoading] = useState(false);

  const getContactByEmail = useCallback(async (email: string) => {
    return await fetch(`/api/voyado/get-contact?email=${email}`, { method: 'GET' })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);

        return res.json();
      })
      .then((res) => {
        if (res.errorCode) throw new Error(res.errorCode);
        return res;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }, []);

  // const getContactOverview = useCallback(async (contactId: string) => {
  //   return await fetch(`/api/voyado/get-contact-overview?contactId=${contactId}`, { method: 'GET' })
  //     .then((res) => {
  //       if (!res.ok) throw new Error(res.statusText);
  //
  //       return res.json();
  //     })
  //     .then((res) => {
  //       if (res.errorCode) throw new Error(res.errorCode);
  //
  //       return res;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // }, []);

  const removeCustomer = useCallback(() => {
    setCustomer(null);
    setCustomerOverview(null);
    removeContact();
  }, [setCustomer, setCustomerOverview, removeContact]);

  const getVoyadoPromotions = useCallback(async (contactId: string) => {
    return await fetch(`/api/voyado/get-promotions?contactId=${contactId}`, {
      method: 'GET',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        if (res.errorCode) {
          throw new Error(res.errorCode);
        }
        return res;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }, []);

  const getVoyadoVouchers = useCallback(async (contactId: string): Promise<VoyadoVouchers> => {
    return await fetch(`/api/voyado/get-vouchers?contactId=${contactId}`, {
      method: 'GET',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        if (res.errorCode) {
          throw new Error(res.errorCode);
        }
        return res;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }, []);

  const redeemVoyadoVoucher = useCallback(
    async (
      contactId: string,
      bonusCheckId: string,
    ): Promise<{
      success: boolean;
      message?: string;
    }> => {
      return await fetch('/api/voyado/redeem-voucher', {
        method: 'POST',
        body: JSON.stringify({ contactId, bonusCheckId }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return await res.json();
        })
        .catch((error) => {
          console.error('Redeem error', error);
          throw error;
        });
    },
    [],
  );

  const refreshVouchers = useCallback(async () => {
    if (!customer?.contactId) return;
    const updatedVouchers = await getVoyadoVouchers(customer.contactId);
    setCustomer((prev) => (prev ? { ...prev, vouchers: updatedVouchers } : prev));

    return updatedVouchers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, getVoyadoVouchers]);

  const init = useCallback(
    async (email: string) => {
      setVoyadoLoading(true);
      try {
        if (!email) throw new Error('No email provided');

        const contact = await getContactByEmail(email);
        // const contactOverview = await getContactOverview(contact.id);
        const {
          id,
          attributes: {
            firstName,
            lastName,
            memberNumber,
            bonusBasedLevel,
            bonusBasedLevelChanged,
            bonusBasedLevelExpires,
            bonusBasedLevelLeftForUpgrade,
            memberLevelsBonusPoints,
            bonusPoints,
            mobilePhone,
            street,
            city,
            zipCode,
            countryCode,
          },
        } = contact;

        identifyWithContact(contact);

        const [vouchers, promotions] = await Promise.all([getVoyadoVouchers(id), getVoyadoPromotions(id)]);

        setCustomer({
          contactId: id,
          email,
          firstName,
          lastName,
          displayName: getDisplayName(email, { firstName, lastName }),
          mobilePhone,
          memberNumber,

          bonusBasedLevel,
          bonusBasedLevelChanged,
          bonusBasedLevelExpires,
          bonusBasedLevelLeftForUpgrade,
          memberLevelsBonusPoints,
          bonusPoints,

          vouchers,
          promotions,
          street,
          city,
          zipCode,
          countryCode,
        });

        // setCustomerOverview(contactOverview);
      } catch (error) {
        console.error('[VoyadoProvider.init]:', error);
        setCustomer(null);
        setCustomerOverview(null);
      } finally {
        setVoyadoLoading(false);
      }
    },
    [getContactByEmail, getVoyadoPromotions, getVoyadoVouchers, identifyWithContact, setCustomer, setCustomerOverview],
  );

  const startVoyado = useCallback(
    async (contactId: string) => {
      await fetch(`/api/voyado/voyado-start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cartToken}`,
        },
        body: JSON.stringify({ contactId: contactId }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res.errorCode) {
            throw new Error(res.errorCode);
          }
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    },
    [cartToken],
  );

  const addPromotion = useCallback(
    async (id: string) => {
      await fetch(`/api/voyado/add-promotion`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cartToken}`,
        },
        body: JSON.stringify({ promotionInstanceId: id }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res.error) {
            throw new Error(res.error);
          }
          getSession();
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    },
    [cartToken, getSession],
  );

  const deletePromotion = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/voyado/delete-promotion?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${cartToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        // Only attempt to parse JSON if there's content
        if (res.status !== 204) {
          const data = await res.json();
          if (data.errorCode) {
            throw new Error(data.errorCode);
          }
        }

        // Proceed with session retrieval or other logic
        getSession();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [cartToken, getSession],
  );
  const addVoucher = useCallback(
    async (id: string) => {
      await fetch(`/api/voyado/add-voucher`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cartToken}`,
        },
        body: JSON.stringify({ checkNumber: id }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (res.error) {
            throw new Error(res.error);
          }
          getSession();
        })
        .catch((error) => {
          console.error(error);
          throw error;
        });
    },
    [cartToken, getSession],
  );

  const deleteVoucher = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/voyado/delete-voucher?id=${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${cartToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        // Only attempt to parse JSON if there's content
        if (res.status !== 204) {
          const data = await res.json();
          if (data.errorCode) {
            throw new Error(data.errorCode);
          }
        }

        // Proceed with session retrieval or other logic
        getSession();
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [cartToken, getSession],
  );

  const contextObject = {
    voyadoLoading,
    init,
    removeCustomer,

    customer,
    customerOverview,
    startVoyado,

    addPromotion,
    deletePromotion,
    selectedPromotion,
    setSelectedPromotion,

    refreshVouchers,
    redeemVoyadoVoucher,
    addVoucher,
    deleteVoucher,

    isOffersOpen,
    setIsOffersOpen,
  };

  return <VoyadoContext.Provider value={contextObject}>{children}</VoyadoContext.Provider>;
};

export default VoyadoProvider;

export const useVoyado = () => useContext(VoyadoContext);
