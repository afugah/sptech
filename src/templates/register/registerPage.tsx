'use client';

import React, { useEffect, useState } from 'react';
import Register from '@/src/components/header/LoginForm/components/CreateAccount';
import { useIdentification } from '@/src/context/identificationContext';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

const RegisterPage: React.FC = () => {
  const [contactData, setContactData] = useState<IVoyado.Contact>();
  const { fetchContactData } = useIdentification();

  useEffect(() => {
    fetchContactData().then(setContactData);
  }, [fetchContactData]);

  return (
    <div className={'container md:px-16 lg:px-64 2xl:px-96'}>
      <Register key={contactData?.id} withHeaderImage={false} withDescription={false} defaultValues={contactData} />
    </div>
  );
};

export default RegisterPage;
