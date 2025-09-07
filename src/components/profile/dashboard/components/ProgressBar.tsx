import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ProgressBarProps {
  points: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ points }) => {
  const t = useTranslations();
  const levels = {
    member: { min: 0, max: 1499 },
    silver: { min: 1500, max: 4999 },
    gold: { min: 5000, max: 10000 },
  };
  let progress = 0;
  if (points >= levels.gold.min) {
    progress = 100;
  } else if (points >= levels.silver.min) {
    progress = ((points - levels.silver.min) / (levels.gold.min - levels.silver.min)) * 100;
  } else {
    progress = (points / levels.silver.min) * 100;
  }

  return (
    <div className={'w-full'}>
      <div className={'relative mb-3 inline-block -translate-x-1/2'} style={{ marginLeft: `${progress}%` }}>
        <div className={'rounded-lg bg-creme px-4 py-2 text-center text-black'}>
          {new Intl.NumberFormat('sv-SE').format(points)} {t('member.member-points')}
        </div>
        <div
          className={
            'absolute bottom-[-6px] left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-creme'
          }
        />
      </div>

      <div className={'relative h-2 overflow-hidden rounded-full bg-gray-200'}>
        <div className={'h-full bg-black'} style={{ width: `${progress}%` }} />
      </div>

      <div className={'mt-2 flex justify-between text-xs'}>
        <div
          className={classNames('flex flex-col items-start text-gray', {
            '!text-black': points > levels.member.min,
          })}
        >
          <span>Member</span>
          <span>0 - 1499p</span>
        </div>

        <div
          className={classNames('flex flex-col items-center text-gray', {
            'text-black': points > levels.silver.max,
          })}
        >
          <span>Silver</span>
          <span>1500 - 4999p</span>
        </div>

        <div
          className={classNames('flex flex-col items-end text-gray', {
            'text-black': levels.gold.min > points,
          })}
        >
          <span>Gold</span>
          <span>5000+ p</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
