import React from 'react';

interface IToastProps {
  message: string | null;
  isVisible: boolean;
}

export const Toast: React.FC<IToastProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) return null;

  return (
    <div
      className={`fixed left-1/2 top-1/2 z-[99] -translate-x-1/2 transform rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 opacity-80 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
};
