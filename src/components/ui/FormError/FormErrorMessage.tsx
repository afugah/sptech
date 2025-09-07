import React from 'react';
import ErrorCircleIcon from '@/src/images/icons/error_red_circle.svg';

const FormErrorMessage = ({ message, className }: { message: string; className?: string }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-red bg-backgroundAlternative p-4 ${className}`}
    >
      <div className={'mr-2 text-red-600'}>
        <ErrorCircleIcon />
      </div>
      <span className={'text-xs font-bold text-red-600 '}>{message}</span>
    </div>
  );
};

export default FormErrorMessage;
