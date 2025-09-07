import classNames from 'classnames';
import { ArrowUpToLine } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useCallback } from 'react';
import { Button } from '@/components/shadcn/button';
import { PaginationButton } from '@/src/components/ui/Pagination/PaginationButton';
import { usePaginationRange } from '@/src/components/ui/Pagination/usePaginationRange';
import { Link, usePathname } from '@/src/i18n/navigation';
import ArrowLeftLong from '@/src/images/icons/arrow-left-long.svg';
import ArrowLeftLongWhite from '@/src/images/icons/arrow-left-long-white.svg';
import ArrowRightLong from '@/src/images/icons/arrow-right-long.svg';
import ArrowRightLongWhite from '@/src/images/icons/arrow-right-long-white.svg';

export enum PaginationAlign {
  Start,
  Center,
  End,
}

interface IPaginationProps {
  /**
   * @description Starts with 0
   */
  currentPage: number;
  totalPages: number;

  /**
   * @description Min number of page buttons from each side of the current page button.
   * @default 1
   */
  siblingCount?: number;

  /**
   * @default PaginationAlign.Start
   */
  align?: PaginationAlign;

  className?: string;
  onPageChange: (page: number) => void;

  shownItems: number;
  allItems: number;

  /**
   * @description Use View More button instead of traditional pagination
   * @default false
   */
  useViewMore?: boolean;

  /**
   * @description Loading state for View More button
   * @default false
   */
  isLoading?: boolean;
}

const PaginationComponent: React.FC<IPaginationProps> = (props) => {
  const {
    currentPage: page,
    totalPages,
    siblingCount,
    align = PaginationAlign.Start,
    className,
    onPageChange,
    shownItems,
    allItems,
    useViewMore = true,
    isLoading = false,
  } = props;
  const currentPage = page;

  const t = useTranslations('product.list');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paginationRange = usePaginationRange({
    currentPage,
    totalPages,
    siblingCount,
    dotsSymbol: '...',
  });

  const showingText = useViewMore
    ? t('showing_other', { currCount: shownItems, count: allItems })
    : shownItems === 1
      ? t('showing_one', {
          currCount: shownItems,
          count: allItems,
        })
      : t('showing_other', { currCount: shownItems, count: allItems });

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNum.toString());
    if (pageNum === 1) return pathname;
    return `${pathname}?${params.toString()}`;
  };

  const handleViewMore = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const hasMoreItems = currentPage < totalPages;

  if (totalPages <= 1 && !isLoading) return null;

  if (useViewMore) {
    return (
      <div className={classNames('mx-6 flex flex-col items-center pb-6', className)}>
        {!isLoading && <p className={'mb-6 text-center text-sm'}>{showingText}</p>}

        <Button
          onClick={handleViewMore}
          disabled={isLoading || !hasMoreItems}
          variant={'default'}
          size={'xl'}
          className={'mb-8 text-white'}
          loading={isLoading}
        >
          {!hasMoreItems ? t('all_items_loaded') : t('view_more')}
        </Button>

        <Button
          onClick={handleBackToTop}
          variant={'ghost'}
          size={'sm'}
          className={'flex h-auto items-center gap-2 p-0 text-sm hover:underline'}
        >
          {t('back_to_top')}
          <ArrowUpToLine className={'h-4 w-4'} />
        </Button>
      </div>
    );
  }

  return (
    <div className={classNames('mx-6', className)}>
      <p className={'mb-6 text-center text-xs'}>{showingText}</p>
      <div
        className={classNames('flex flex-row items-center gap-2', {
          'justify-start': align === PaginationAlign.Start,
          'justify-center': align === PaginationAlign.Center,
          'justify-end': align === PaginationAlign.End,
        })}
      >
        <Link
          href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
          onClick={(e) => {
            if (currentPage === 1) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            onPageChange(currentPage - 1);
          }}
          aria-disabled={currentPage === 1}
          className={classNames(
            'group flex h-[40px] items-center justify-center rounded-full border border-black px-5 py-1 transition-colors',
            {
              'pointer-events-none cursor-not-allowed opacity-50': currentPage === 1,
              'hover:bg-black hover:text-white': currentPage > 1,
            },
          )}
        >
          <ArrowLeftLong className={'h-5 w-5 group-hover:hidden'} />
          <ArrowLeftLongWhite className={'hidden h-5 w-5 group-hover:block'} />
        </Link>
        {paginationRange.map((pageNum, idx) => (
          <PaginationButton
            key={`${pageNum}-${idx}`}
            active={pageNum === currentPage}
            page={pageNum}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            href={typeof pageNum === 'number' ? createPageUrl(pageNum) : undefined}
          />
        ))}
        <Link
          href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
          onClick={(e) => {
            if (currentPage === totalPages) {
              e.preventDefault();
              return;
            }
            e.preventDefault();
            onPageChange(currentPage + 1);
          }}
          aria-disabled={currentPage === totalPages}
          className={classNames(
            'group flex h-[40px] items-center justify-center rounded-full border border-black px-5 py-1 transition-colors',
            {
              'pointer-events-none cursor-not-allowed opacity-50': currentPage === totalPages,
              'hover:bg-black hover:text-white': currentPage < totalPages,
            },
          )}
        >
          <ArrowRightLong className={'h-5 w-5 group-hover:hidden'} />
          <ArrowRightLongWhite className={'hidden h-5 w-5 group-hover:block'} />
        </Link>
      </div>
    </div>
  );
};

export const Pagination: React.FC<IPaginationProps> = (props) => {
  return (
    <Suspense fallback={<div className={'flex animate-pulse justify-center py-4'}>Loading pagination...</div>}>
      <PaginationComponent {...props} />
    </Suspense>
  );
};
