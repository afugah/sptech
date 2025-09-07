import React from 'react';
import BonusCheck from './components/BonusCheck';

interface BonusProps {
  bonusAmount: string;
}

const Bonus: React.FC<BonusProps> = ({ bonusAmount }) => {
  return (
    <div className={'container flex flex-col items-center gap-y-16 pb-6'} id={bonusAmount}>
      <BonusCheck bonusAmount={bonusAmount} />
    </div>
  );
};

export default Bonus;
