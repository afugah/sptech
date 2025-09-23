'use client';

import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SizeCharts } from '@/src/types/framework/storyblok-components';
import { CollapseRounded } from '../../ui/CollapseRounded';

const SizeChartsComponent: IStoryblok.FC<SizeCharts> = ({ blok }) => {
  if (!blok?.sizes || blok.sizes.length === 0) {
    return <div>No size chart data available.</div>;
  }

  const rows = [
    { label: 'Size', values: blok.sizes.map((item) => item.size) },
    { label: '', values: blok.sizes.map((item) => item.default) },
    { label: 'BYST', values: blok.sizes.map((item) => item.byst) },
    { label: 'MIDJA', values: blok.sizes.map((item) => item.midja) },
    { label: 'STUSS', values: blok.sizes.map((item) => item.stuss) },
    { label: 'Uk', values: blok.sizes.map((item) => item.uk) },
    { label: 'Hips', values: blok.sizes.map((item) => item.hips) },
  ];

  return (
    <CollapseRounded titleClassName={'text-black text-left text-sm'} title={blok.title}>
      <div className={'mt-1 text-sm'}>
        <h2 className={'mb-4 text-left text-sm text-secondary'}>{blok.description}</h2>
        <div className={'overflow-x-auto'}>
          <table className={'w-full table-auto border-collapse text-left'}>
            <tbody>
              {rows
                .filter((i) => i.values.filter(Boolean).length)
                .map((row) => {
                  if (row.label === 'Size') {
                    return (
                      <tr key={row.label}>
                        <td className={'h-8 w-5 p-2'}> </td>
                        {row.values.map((value, idx) => (
                          <td key={idx} className={'p-2 text-center text-gray'}>
                            <div
                              className={
                                'm-auto flex h-8 w-8 items-center justify-center rounded-full bg-black p-2 text-center text-sm font-bold text-white'
                              }
                            >
                              {value}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                    <tr key={row.label}>
                      <td className={'p-2 uppercase'}>{row.label}</td>
                      {row.values.map((value, idx) => (
                        <td key={idx} className={'p-2 text-center text-gray'}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </CollapseRounded>
  );
};

export default SizeChartsComponent;
