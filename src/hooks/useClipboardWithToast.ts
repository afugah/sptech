import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface IClipboardWithToastProps {
  productId: string;
  variationId: string;
  productName: string;
}

export const useClipboardWithToast = ({ productId, variationId, productName }: IClipboardWithToastProps) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('product-page');

  useEffect(() => {
    let keySequence = '';

    const handleKeyDown = (event: KeyboardEvent) => {
      keySequence += event.key.toUpperCase();

      if (keySequence.length > 2) {
        keySequence = keySequence.slice(-2);
      }

      switch (keySequence) {
        case 'CC':
          if (productId) {
            handleCopy(productId, `${t('info.product-id')}`);
          }
          break;
        case 'NN':
          if (variationId) {
            handleCopy(variationId, `${t('info.variant-id')}`);
          }
          break;
        case 'BB':
          if (productName) {
            handleCopy(productName, `${t('info.product-name')}`);
          }
          break;
        default:
          break;
      }
    };

    const handleCopy = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      triggerToast(`${t('copied')} ${label}`);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, variationId, productName]);

  const triggerToast = (message: string) => {
    setCopiedText(message);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 1500);
  };

  return { copiedText, isVisible };
};
