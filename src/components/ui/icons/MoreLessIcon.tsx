import classNames from 'classnames';

interface IMoreLessIconProps {
  isExpanded: boolean;

  className?: string;
}

export const MoreLessIcon: React.FC<IMoreLessIconProps> = ({ isExpanded, className }) => (
  <svg
    className={className}
    width={'30'}
    height={'30'}
    viewBox={'0 0 30 30'}
    fill={'none'}
    xmlns={'http://www.w3.org/2000/svg'}
  >
    <circle cx={'15'} cy={'15'} r={'14.5'} stroke={'#D6D6D6'} />
    <line
      x1={'14.8477'}
      y1={'6.52148'}
      x2={'14.8477'}
      y2={'23.478'}
      stroke={'#D6D6D6'}
      className={classNames('origin-center transition-transform duration-300', { 'rotate-90': isExpanded })}
    />
    <line
      x1={'23.4766'}
      y1={'14.8477'}
      x2={'6.52004'}
      y2={'14.8477'}
      stroke={'#D6D6D6'}
      className={classNames('origin-center transition-transform duration-300', { 'rotate-180': isExpanded })}
    />
  </svg>
);
