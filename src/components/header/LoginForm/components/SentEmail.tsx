import React from 'react';
import { Button } from '@/src/components/ui/Button';
import FloatingLabelInput from '@/src/components/ui/Checkbox/Input';

const SentEmail = () => {
  return (
    <div className={'flex flex-col gap-y-10 p-14 pt-0'}>
      <h2 className={'text-center text-2xl'}>Sent!</h2>
      <p className={'text-center text-sm'}>
        We have just sent an email with a link to your email adress, please click the link and follow the instructions.
      </p>

      <FloatingLabelInput label={'Email'} type={'email'} onChange={() => {}} value={''} required />

      <Button className={'w-full uppercase'} buttonType={Button.Type.Filled} buttonColor={Button.Color.Dark}>
        Continue shopping
      </Button>

      <div className={'w-full text-center'}>
        <span>Need more help? See our</span>
        <span className={'underline'}> FAQ</span>
      </div>
    </div>
  );
};
export default SentEmail;
