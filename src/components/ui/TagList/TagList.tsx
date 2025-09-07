'use client';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useResizeObserver, useWindowSize } from 'usehooks-ts';
import { MEDIUM } from '@/src/styles/theme';
import { type ITagListProps, Tag } from './';

/**
 * @deprecated No longer used - https://app.asana.com/0/1208043166295195/1208564966133777/f
 *
 * Has more efficient implementation if we need only limited and fixed number of tags.
 * See {@link ITagListProps}.
 *
 * ~~@deprecated Do not use directly. See {@link ITagListProps}.~~
 *
 * ~~Has workaround and window/container width-based positioning.~~
 *
 * ~~Should not be rendered at all when no tags are provided.~~
 */
export const TagListImpl: React.FC<ITagListProps> = (props) => {
  const { tags, className, tagClassName } = props;
  const t = useTranslations('');

  const [isOpen, setIsOpen] = useState(false);
  const [firstRowTags, setFirstRowTags] = useState(tags.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { width } = useResizeObserver({ ref: containerRef as React.RefObject<HTMLElement> });
  const { width: windowWidth } = useWindowSize();
  const isMobile = useMemo(() => windowWidth < MEDIUM, [windowWidth]);

  const GAP_SIZE = 20;

  useLayoutEffect(() => {
    if (!width || !containerRef.current || !buttonRef.current || isMobile) return;

    const container = containerRef.current;
    const btnElement = buttonRef.current;
    const tagsElements = Array.from(container.querySelectorAll('.tag'));
    const containerWidth = container.getBoundingClientRect().width;

    let totalWidth = btnElement.getBoundingClientRect().width;
    let visibleTagsCount = 0;

    for (const element of tagsElements) {
      const tagWidth = element.getBoundingClientRect().width;

      if (totalWidth + tagWidth + GAP_SIZE > containerWidth) break;

      totalWidth += tagWidth + GAP_SIZE;
      visibleTagsCount++;
    }

    setFirstRowTags(visibleTagsCount);
  }, [tags.length, width, isMobile, windowWidth]);

  const visibleTags = tags.slice(0, firstRowTags);
  const hiddenTags = tags.slice(firstRowTags);

  const renderTag = useCallback(
    (tag: string | { url: string; label: string }, index: number) => {
      const { url, label } = typeof tag === 'string' ? { url: undefined, label: tag } : tag;

      return (
        <Tag key={index} url={url} className={classNames('tag border border-black', tagClassName)}>
          {label}
        </Tag>
      );
    },
    [tagClassName],
  );

  return (
    <div
      className={classNames(
        'hide-scrollbar flex flex-row flex-wrap justify-center gap-[20px] overflow-auto align-top transition-[height] lg:justify-center lg:overflow-hidden',
        className,
      )}
      style={{ height: isMobile || isOpen ? 'auto' : 32 }}
      ref={containerRef}
    >
      {visibleTags.map(renderTag)}

      {!isMobile && (
        <button
          ref={buttonRef}
          className={classNames('transition-opacity', {
            'pointer-events-none h-0 opacity-0 [&>div]:!cursor-default': isOpen,
            'pointer-events-none invisible absolute': !hiddenTags.length,
          })}
          tabIndex={isOpen ? -1 : 0}
          onClick={() => setIsOpen(true)}
        >
          <Tag className={'border border-creme bg-creme text-black'}>{t('common.view-more')}</Tag>
        </button>
      )}

      <div
        className={classNames('contents', {
          invisible: !isMobile && !isOpen,
          hidden: !hiddenTags.length,
        })}
      >
        {hiddenTags.map(renderTag)}

        {!isMobile && (
          <button onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1}>
            <Tag className={'border border-creme bg-creme text-black'}>See less</Tag>
          </button>
        )}
      </div>
    </div>
  );
};
