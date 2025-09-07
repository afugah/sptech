'use client';

import classNames from 'classnames';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';

interface ProductModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
  titleClassName?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isVisible,
  setIsVisible,
  children,
  showHeader = true,
  title,
  titleClassName,
}) => {
  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className={'max-h-[90vh] overflow-hidden sm:max-w-[425px] lg:max-w-xl'}>
        {showHeader && (
          <DialogHeader className={'bg-creme/40 py-4'}>
            <DialogTitle
              className={classNames(
                'mx-auto font-sans font-bold uppercase tracking-widest',
                titleClassName || 'blink text-sm',
              )}
            >
              {title}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className={'max-h-[calc(95vh-150px)] overflow-y-auto p-6'}>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
