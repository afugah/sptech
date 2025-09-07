'use client';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const NewsletterModal = ({
  modalState,
  setOpenModal,
  children,
  className,
}: {
  modalState: boolean;
  setOpenModal: (state: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  return createPortal(
    <div
      onClick={() => setOpenModal(!modalState)}
      className={
        'transition-opacity-transform fixed inset-0 z-50  flex w-full items-center justify-center overflow-y-auto bg-gray-900   bg-opacity-60 px-4'
      }
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className={cn('w-full rounded-md bg-alabaster p-2 ', className)}
      >
        <div className={'relative'}>
          <p
            onClick={() => setOpenModal(!modalState)}
            className={
              'absolute -right-[1.1rem] -top-[1.2rem] flex size-5 cursor-pointer items-center justify-center rounded-full bg-gray-700 pb-1 text-white'
            }
          >
            <span>x</span>
          </p>

          {children}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export default NewsletterModal;
