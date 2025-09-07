import React from 'react';

interface CircularProgressProps {
  points: number;
  nextLevel: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ points, nextLevel }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = points >= nextLevel ? 1 : points / nextLevel;
  const strokeDashoffset = circumference * (1 - progressPercentage);
  return (
    <svg height={120} width={120}>
      <circle stroke={'#F5F2EC'} strokeWidth={'4'} fill={'transparent'} r={radius} cx={60} cy={60} />
      <circle
        stroke={'black'}
        strokeWidth={'4'}
        fill={'transparent'}
        r={radius}
        cx={60}
        cy={60}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={'rotate(-90 60 60)'}
        style={{ transition: 'stroke-dashoffset 0.35s ease' }}
      />
      <text x={'50%'} y={'50%'} textAnchor={'middle'} stroke={'#000'} dy={'.3em'} fontSize={'1.5em'}>
        {points > nextLevel ? 0 : nextLevel - points}p
      </text>
    </svg>
  );
};

export default CircularProgress;
