import React from 'react';
import { useVoyado } from '@/src/context/voyadoContext';
import PasswordChangeForm from './components/PasswordChangeForm';
import PersonalDetailsForm from './components/PersonalDetailsForm';

const Settings: React.FC = () => {
  const { customer } = useVoyado();
  if (!customer) return null;
  return (
    <div className={'p-10'}>
      <h2 className={'mb-6 text-center text-[40px]'}>Settings</h2>
      <div className={'flex justify-center gap-10 max-md:flex-col'}>
        <PersonalDetailsForm
          firstName={customer.firstName}
          lastName={customer.lastName}
          email={customer.email}
          mobilePhone={customer.mobilePhone}
        />
        <PasswordChangeForm />
      </div>
    </div>
  );
};

export default Settings;
