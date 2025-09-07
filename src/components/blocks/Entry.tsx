'use client';

import ArrowIcon from '@images/icons/arrow-right-white.svg';
import { storyblokEditable } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Link } from '@/src/i18n/navigation';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Entry } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import styles from './Entry.module.css';

const EntryComponent: IStoryblok.FC<Entry> = ({ blok }) => {
  const { image, preamble, title = '', badge, buttonText, link } = blok;

  return (
    <div {...storyblokEditable(blok)} data-test={'entry'} className={styles.entryContainer}>
      {badge && <Badge>{badge}</Badge>}
      <Link href={link || '#'}>
        {(image as StoryblokImage)?.filename && (
          <Image
            src={(image as StoryblokImage).filename || ''}
            alt={title}
            fill
            priority={true}
            sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          />
        )}
        <div className={styles.entryContent}>
          <p className={styles.entryPreamble}>{preamble}</p>
          <h1 className={styles.entryTitle}>{title}</h1>
          <Button buttonType={Button.Type.Outline} className={styles.entryButton}>
            {buttonText} <ArrowIcon />
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default EntryComponent;
