'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactCanvasConfetti, { type IProps } from 'react-canvas-confetti';

type CreateConfetti = NonNullable<Parameters<NonNullable<IProps['refConfetti']>>[0]>;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getAnimationSettings(originXA: number, originXB: number) {
  return {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    particleCount: 150,
    colors: ['#39b39b', '#ffffff'],
    origin: {
      x: randomInRange(originXA, originXB),
      y: Math.random() - 0.2,
    },
  };
}

const Fireworks = () => {
  const refAnimationInstance = useRef<CreateConfetti | null>(null);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval>>();

  const getInstance = useCallback((instance: CreateConfetti | null) => {
    refAnimationInstance.current = instance;
  }, []);

  const nextTickAnimation = useCallback(() => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current(getAnimationSettings(0.1, 0.3));
      refAnimationInstance.current(getAnimationSettings(0.7, 0.9));
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!intervalId) {
      setIntervalId(setInterval(nextTickAnimation, randomInRange(1100, 1300)));
    }
  }, [intervalId, nextTickAnimation]);

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  startAnimation();
  return (
    <>
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
    </>
  );
};

export default Fireworks;
