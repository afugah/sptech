import React from 'react';
import { Button } from '@/src/components/ui/Button';
import FloatingLabelInput from '@/src/components/ui/Checkbox/Input';

const NewPartner = () => {
  return (
    <div className={'flex flex-col gap-y-10 p-14 pt-0'}>
      <h2 className={'text-center text-2xl'}>Looks like you’re new.</h2>
      <p className={'text-center text-sm'}>
        Enter the email address associated with your account to receive a link to reset your password.
      </p>
      <FloatingLabelInput label={'Email'} type={'email'} onChange={() => {}} value={''} required />
      <Button className={'w-full'} buttonType={Button.Type.Outline} buttonColor={Button.Color.Dark}>
        Sign up
      </Button>
      <div>
        <span>Need more help? See our</span>
        <span className={'underline'}>FAQ</span>
      </div>
    </div>
  );
};
export default NewPartner;
