import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './RangeInput.module.css';

interface IMultiRangeSliderProps {
  name: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;

  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MultiRangeSlider = ({ min, max, minValue, maxValue, onChange }: IMultiRangeSliderProps) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  const minValRef = useRef(min);
  const maxValRef = useRef(max);

  const range = useRef<HTMLDivElement>(null);

  const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max]);

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className={'flex w-full flex-col'}>
      <div className={'relative mb-10 flex h-[80px] items-center justify-center'}>
        <input
          className={cn(styles.rangeInput, styles.left)}
          type={'range'}
          min={minValue}
          max={maxValue}
          name={'min'}
          value={minVal}
          onChange={(event) => {
            event.preventDefault();
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
            onChange(event);
          }}
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />

        <input
          className={cn(styles.rangeInput, styles.right)}
          type={'range'}
          name={'max'}
          min={minValue}
          max={maxValue}
          value={maxVal}
          onChange={(event) => {
            event.preventDefault();
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
            onChange(event);
          }}
        />

        <div className={'relative w-full'}>
          <div className={'absolute h-[2px] w-full rounded-[3px] bg-[#000000]'} />
          <div className={'z-2 absolute left-[34%] h-[2px] w-[46%] rounded-[3px] bg-[#000000]'} ref={range} />
          <div className={'absolute left-[6px] mt-[20px] text-[12px] text-[#000000]'}>{minVal} KR</div>
          <div className={'absolute right-0 mt-[20px] text-[12px] text-[#000000]'}>{maxVal} KR</div>
        </div>
      </div>
    </div>
  );
};

export default MultiRangeSlider;
