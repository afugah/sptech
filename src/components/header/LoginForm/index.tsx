'use client';

import React, { useEffect, useState } from 'react';
import { useIdentification } from '@/src/context/identificationContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';
import { UserModalViewEnum } from '@/src/lib/types/common';
import { Drawer } from '../../ui/Drawer';
import CreateAccount from './components/CreateAccount';
import ForgotPassword from './components/ForgotPassword';
import Login from './components/Login';
import NewPartner from './components/NewPartner';
import NewsletterSignUp from './components/NewsletterSignUp';
import SentEmail from './components/SentEmail';

const LoginForm = () => {
  const { isMenuOpen, showView, setShowView } = useUserDrawer();
  const [contactData, setContactData] = useState<IVoyado.Contact>();
  const { fetchContactData } = useIdentification();
  //newsletter popup timer
  /*  const { isSignedIn } = useUser();
    const contact = getTokenPayload();

    useEffect(() => {
      if (!isSignedIn && !contact?.contactId) {
        const hasShownNewsletter = sessionStorage.getItem('hasShownNewsletterPopup');

        if (!hasShownNewsletter) {
          const timer = setTimeout(() => {
            setShowView(UserModalViewEnum.NEWSLETTER_SIGN_UP);
            sessionStorage.setItem('hasShownNewsletterPopup', 'true');
          }, 15000);
          return () => clearTimeout(timer);
        }
      }
    }, [isSignedIn, contact?.contactId, setShowView]);*/

  useEffect(() => {
    showView === UserModalViewEnum.LOGIN && fetchContactData().then(setContactData);
  }, [fetchContactData, showView]);

  return (
    <Drawer
      onClose={() => {
        setShowView(null);
      }}
      className={'w-[522px]'}
      open={isMenuOpen}
    >
      {showView === UserModalViewEnum.LOGIN && <Login />}
      {showView === UserModalViewEnum.SIGN_UP && <CreateAccount key={contactData?.id} defaultValues={contactData} />}
      {showView === UserModalViewEnum.NEWSLETTER_SIGN_UP && <NewsletterSignUp />}
      {showView === UserModalViewEnum.FORGOT_PASSWORD && <ForgotPassword />}
      {showView === UserModalViewEnum.NEW_PARTNER && <NewPartner />}
      {showView === UserModalViewEnum.SENT_EMAIL && <SentEmail />}
    </Drawer>
  );
};

export default LoginForm;
