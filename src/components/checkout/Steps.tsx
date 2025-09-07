import CheckmarkIcon from '@images/icons/circle-check.svg';
import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Steps.module.css';

type Props = { step: string };

const Steps = ({ step, ...props }: Props) => (
  <div {...props} className={styles.checkoutStepsContainer}>
    <div className={cn(styles.checkoutStep, step === 'payment' && styles.completed)}>
      <div className={styles.checkoutStepIconContainer}>
        <CheckmarkIcon />
      </div>{' '}
      Shipping
    </div>
    <div className={cn(styles.checkoutStepLine, styles.checkoutStepLineLeft, step === 'payment' && styles.completed)} />
    <div className={styles.checkoutStep}>
      <div className={styles.checkoutStepIconContainer}>
        <CheckmarkIcon />
      </div>{' '}
      Payment
    </div>
    <div className={cn(styles.checkoutStepLine, styles.checkoutStepLineRight)} />
    <div className={styles.checkoutStep}>
      <div className={styles.checkoutStepIconContainer}>
        <CheckmarkIcon />
      </div>{' '}
      Success
    </div>
  </div>
);

export default Steps;
