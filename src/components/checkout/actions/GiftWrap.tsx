import ChevronDownIcon from '@images/icons/chevron-down.svg';
import GiftWrapIcon from '@images/icons/gifts.svg';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import sharedStyles from '../Shared.module.css';
import styles from './GiftWrap.module.css';

const GiftWrap = ({ ...props }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div {...props} className={styles.giftwrapContainer} onClick={() => setExpanded(!expanded)}>
      <div className={sharedStyles.checkoutTab}>
        <span>
          <GiftWrapIcon />
          Add Gift wrapping
        </span>
        <div className={cn(styles.arrowWrapper, expanded && styles.expanded)}>
          <ChevronDownIcon />
        </div>
      </div>
      <div className={cn(styles.inputWrapper, expanded && styles.expanded)}>
        <div>
          {/** 
          <Checkbox checked={false} label={"Arlo Sneaker"} />
          <Checkbox checked={false} label={"Clean 90 Sneaker"} />
          */}
        </div>
      </div>
    </div>
  );
};

export default GiftWrap;
