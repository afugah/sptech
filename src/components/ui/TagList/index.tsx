'use client';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { Tag, type TagTemplate } from '@/src/components/ui/TagList/Tag';
export * from './Tag';

export interface ITagListProps {
  tags: string[] | { url: string; label: string }[];

  /**
   * @default 5
   */
  maxTags?: number;

  /**
   * Style template to apply to all tags
   * @default 'round'
   */
  template?: TagTemplate;

  className?: string;
  tagClassName?: string;
}

export const TagList: React.FC<ITagListProps> = ({
  tags,
  maxTags = 5,
  template = 'round',
  className,
  tagClassName,
}) => {
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);

  const renderTag = useCallback(
    (tag: string | { url: string; label: string }, idx: number) => {
      const { url, label } = typeof tag === 'string' ? { url: undefined, label: tag } : tag;

      return (
        <Tag
          key={`${url}-${idx}`}
          url={url}
          template={template}
          className={classNames('tag border border-black', tagClassName)}
        >
          {label}
        </Tag>
      );
    },
    [tagClassName, template],
  );

  const [visibleTags, hiddenTags] = useMemo(() => [tags.slice(0, maxTags), tags.slice(maxTags)], [maxTags, tags]);

  if (!tags.length) return null;

  return (
    <div className={classNames('flex flex-col items-center gap-y-5', className)}>
      <div className={'flex flex-wrap justify-center gap-5'}>
        {visibleTags.map(renderTag)}

        {!!hiddenTags.length && (
          <button
            className={classNames('transition-opacity', {
              'pointer-events-none h-0 opacity-0 [&>div]:!cursor-default': isOpen,
              'pointer-events-none invisible absolute': !hiddenTags.length,
            })}
            tabIndex={isOpen ? -1 : 0}
            onClick={() => setIsOpen(true)}
          >
            <Tag template={template} className={'border border-creme bg-creme text-black'}>
              {t('common.view-more')}
            </Tag>
          </button>
        )}
      </div>

      {!!hiddenTags.length && (
        <div
          className={classNames('grid transition-[opacity,grid-template-rows] duration-300', {
            'active grid-rows-[1fr] opacity-100': isOpen,
            'grid-rows-[0fr] opacity-0': !isOpen,
          })}
        >
          <div className={'flex flex-wrap justify-center gap-5 overflow-hidden'}>
            {hiddenTags.map(renderTag)}

            <button onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1}>
              <Tag template={template} className={'border border-creme bg-creme text-black'}>
                See less
              </Tag>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
