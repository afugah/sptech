import ArrowBottom from '@images/icons/arrow-bottom.svg';
import Close from '@images/icons/close.svg';
import Ruler from '@images/icons/ruler.svg';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSizeGuideDrawer } from '@/src/context/sizeGuideDrawer';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
interface SizeSelectorProps {
  variants: IProductVariant[];
  selectedVariantId: string | undefined;
  setSelectedVariantId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ variants, selectedVariantId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setIsSizeGuideOpen } = useSizeGuideDrawer();
  const t = useTranslations();

  // const toggleDropdown = () => {
  //   setIsDropdownOpen((prev) => !prev);
  // };

  const ref = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as React.RefObject<HTMLDivElement>, () => {
    setIsDropdownOpen(false);
  });

  return (
    <>
      {isDropdownOpen && (
        <div className={'fixed inset-0 z-20 bg-black bg-opacity-50 text-xs uppercase underline'}>View Size guide</div>
      )}
      <div ref={ref} className={'relative z-20 mr-3 w-auto py-4'}>
        <span className={'cursor-pointer text-xs uppercase underline'} onClick={() => setIsDropdownOpen(true)}>
          {t('view-size-guide')}
        </span>
        {isDropdownOpen && (
          <div className={'absolute'}>
            <div className={'flex w-[280px] items-center justify-between p-2 shadow-lg sm:w-96'}>
              <button
                type={'button'}
                className={
                  'flex items-center rounded-2xl border-gray-300 bg-white p-2 text-sm text-gray-500 hover:text-gray-700'
                }
              >
                <Ruler className={'mr-2'} />
                {t('view-size-guide')}
              </button>

              <button
                type={'button'}
                className={'rounded-full border-gray-300 bg-white p-2 text-gray-500 hover:text-gray-700'}
                onClick={() => setIsDropdownOpen(false)}
              >
                <Close />
              </button>
            </div>

            <div className={'absolute z-30 w-[280px] border border-gray-300 bg-white shadow-lg sm:w-96'}>
              <ul>
                <li>
                  <button
                    type={'button'}
                    className={`bg-gray-100 hover:bg-gray-50 flex w-full items-center justify-between border-b border-gray-300 px-6 py-3 text-left text-sm font-medium`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div>{t('select-size')}</div>
                    <ArrowBottom className={'rotate-180'} />
                  </button>
                </li>

                {variants.map((variant) => (
                  <li key={variant.id}>
                    <button
                      className={`w-full border-b  border-gray-300 px-6 py-3 text-left text-sm font-medium ${
                        variant.id === selectedVariantId ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setIsSizeGuideOpen(true);
                        // setSelectedVariantId(variant.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {variant.variant}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SizeSelector;
