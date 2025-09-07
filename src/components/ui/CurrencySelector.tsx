import classNames from 'classnames';
import { useCart } from '@/src/context/cartContext';
import { usePage } from '@/src/context/pageContext';

interface ICurrencySelectorProps {
  hasHeaderFixed?: boolean;
  showOnMobile: boolean;
}

const CurrencySelector: React.FC<ICurrencySelectorProps> = ({ showOnMobile, hasHeaderFixed = false, ...props }) => {
  const { store } = useCart();
  const { setIsCountrySelectOpen } = usePage();
  const options: { [key: string]: string } = {
    SE: 'SE / SEK',
    FI: 'FI / EUR',
    NO: 'NO / NOK',
  };

  return (
    <div
      {...props}
      onClick={() => setIsCountrySelectOpen(true)}
      className={`realtive space-between cursor-pointer items-center ${showOnMobile ? 'flex lg:hidden' : 'hidden lg:flex'}`}
    >
      <div className={classNames('font-sans text-sm', hasHeaderFixed ? 'text-white' : 'text-black')}>
        {options[store.countryCode]}
      </div>
    </div>
  );
};

export default CurrencySelector;
