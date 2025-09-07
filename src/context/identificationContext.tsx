import { fetchSignInMethodsForEmail } from 'firebase/auth';
import jwt from 'jsonwebtoken';
import { createContext, useCallback, useContext, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { decodeAndDecryptEClub } from '@/src/lib/actions/decodeAndDecryptEClub';
import { type IVoyadoTokenPayload, voyadoContactToJwt } from '@/src/lib/actions/voyadoContactToJwt';
import { auth } from '@/src/lib/configuration/auth';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

declare global {
  interface Window {
    voy?: (command: string, ...args: (string | number | boolean | null | undefined)[]) => void;
  }
}

export type IdentificationContext = {
  getTokenPayload: () => IVoyadoTokenPayload | null;
  getContact: () => Promise<IVoyado.Contact | null>;
  fetchContactData: () => Promise<IVoyado.Contact | undefined>;
  identifyWithContact: (contact: IVoyado.Contact) => Promise<boolean>;
  identifyWithEmail: (email: string) => Promise<boolean>;
  identifyWithId: (id: string) => Promise<boolean>;
  removeContact: () => void;
};

const IdentificationContext = createContext<IdentificationContext>({} as IdentificationContext);

export const IdentificationProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [contactToken, setContactToken] = useLocalStorage<string | null>('contactToken', null, {
    initializeWithValue: true,
  });

  /* #region Voyado API */

  const getContactByEmail = useCallback(
    async (email: string) =>
      await fetch(`/api/voyado/get-contact?email=${email}`, { method: 'GET' })
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);

          return res.json();
        })
        .then((res) => {
          if (res.errorCode) throw new Error(res.errorCode);

          return res;
        })
        .catch((error) => {
          console.error('Error getting contact by email', error);
          throw new Error('Error getting contact by email', { cause: error });
        }),
    [],
  );

  const getContactByContactId = useCallback(
    async (id: string): Promise<IVoyado.Contact> =>
      await fetch(`/api/voyado/get-contact-by-id?contact-id=${id}`, { method: 'GET' })
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);

          return res.json();
        })
        .then((res) => {
          if (res.errorCode) throw new Error(res.errorCode);

          return res;
        })
        .catch((error) => {
          console.error('Error getting contact by id', error);
          throw new Error('Error getting contact by id', { cause: error });
        }),
    [],
  );

  /* #endregion */

  /* #region Identification getters */

  const getTokenPayload = useCallback<() => IVoyadoTokenPayload | null>(() => {
    if (!contactToken) return null;

    return jwt.decode(contactToken) as IVoyadoTokenPayload | null;
  }, [contactToken]);

  const getContact = useCallback<() => Promise<IVoyado.Contact | null>>(async () => {
    const tokenPayload = getTokenPayload();
    if (!tokenPayload) return null;

    return getContactByContactId(tokenPayload.contactId);
  }, [getContactByContactId, getTokenPayload]);

  /* #endregion */

  const fetchContactData = async () => {
    try {
      const contact = await getContact();
      if (!contact) return undefined;

      const signInMethods = await fetchSignInMethodsForEmail(auth, contact.attributes.email);
      if (signInMethods.length) return undefined;

      return contact;
    } catch (error) {
      console.error('Error fetching contact data:', error);
      return undefined;
    }
  };

  /* #region Identification setters */

  const identifyWithContact = useCallback(
    async (contact: IVoyado.Contact): Promise<boolean> => {
      const contactToken = await voyadoContactToJwt(contact).catch(() => null);
      if (!contactToken) return false;

      setContactToken(contactToken);

      // Voyado event and cookie
      if (typeof window !== 'undefined' && window.voy) {
        window.voy('setIdentity', contact.id);
      }

      document.cookie = `_vaI=${contact.id};max-age=${60 * 60 * 24 * 365};path=/`;

      await fetch('/api/voyado/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId: contact.id }),
      }).catch((error) => {
        console.error('Error setting Voyado cookie:', error);
      });
      // end of Voyado event and cookie

      return true;
    },
    [setContactToken],
  );
  const removeContact = () => {
    setContactToken(null);
  };
  const identifyWithEmail = useCallback(
    async (email: string): Promise<boolean> => {
      const contact = await getContactByEmail(email).catch(() => null);
      if (!contact) return false;

      return await identifyWithContact(contact);
    },
    [getContactByEmail, identifyWithContact],
  );

  const identifyWithId = useCallback(
    async (id: string): Promise<boolean> => {
      const contact = await getContactByContactId(id).catch(() => null);
      if (!contact) return false;

      return await identifyWithContact(contact);
    },
    [getContactByContactId, identifyWithContact],
  );

  /* #endregion */

  /* #region Eclub handling  */

  const storeContactDataFromEclub = useCallback(async () => {
    const params = new URLSearchParams(document.location.search);

    const eclub = params.get('eclub');
    if (!eclub) return;

    try {
      const contactData = await decodeAndDecryptEClub(eclub);
      const success = await identifyWithId(contactData.contactId);
      if (!success) {
        console.error('Error identifying with eclub');
        return;
      }

      params.delete('eclub');
      router.replace(`${pathname}?${params}`);
    } catch (error) {
      console.error('Error identifying with eclub', error);
    }
  }, [identifyWithId, pathname, router]);

  useEffect(() => {
    storeContactDataFromEclub();
  }, [storeContactDataFromEclub]);

  /* #endregion */

  return (
    <IdentificationContext.Provider
      value={{
        getTokenPayload,
        getContact,
        fetchContactData,
        identifyWithContact,
        identifyWithEmail,
        identifyWithId,
        removeContact,
      }}
    >
      {children}
    </IdentificationContext.Provider>
  );
};

export const useIdentification = () => useContext(IdentificationContext);
