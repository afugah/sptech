import _ from 'lodash';

interface IProps {
  /**
   * @description Starts with 1
   */
  currentPage: number;

  totalPages: number;
  /**
   * @description Min number of page buttons from each side of the current page button.
   * @default 1
   */
  siblingCount?: number;

  dotsSymbol?: string;
}

export const usePaginationRange = ({
  currentPage = 1,
  totalPages,
  siblingCount = 1,
  dotsSymbol: dots = '...',
}: IProps): Array<string | number> => {
  /**
   * Counts as: `first page, left dot, ...leftSiblings, current page, ...rightSiblings, right dot, last page`
   */
  const totalButtonNumbers = siblingCount * 2 + 3;

  /**
   * Case 1:
   * All pages visible;
   */
  if (totalButtonNumbers >= totalPages) return _.range(1, totalPages + 1);

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const hasLeftDot = leftSiblingIndex > 2;
  const hasRightDot = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  /**
   * Case 2:
   * No left dots; Has right dots;
   */
  if (!hasLeftDot && hasRightDot) {
    const leftItemIndex = currentPage + siblingCount + 1;
    const leftRange = _.range(1, leftItemIndex);

    return [...leftRange, dots, totalPages];
    // return [...leftRange, totalPages];
  }

  /**
   * Case 3:
   * Has left dots; No right dots;
   */
  if (hasLeftDot && !hasRightDot) {
    const rightItemIndex = currentPage - siblingCount;
    const rightRange = _.range(rightItemIndex, totalPages + 1);

    return [firstPageIndex, dots, ...rightRange];
    // return [firstPageIndex, ...rightRange];
  }

  /**
   * Case 4:
   * Has left dots; Has right dots;
   */
  if (hasLeftDot && hasRightDot) {
    const middleRange = _.range(leftSiblingIndex, rightSiblingIndex + 1);

    return [firstPageIndex, dots, ...middleRange, dots, lastPageIndex];
    // return [firstPageIndex, ...middleRange, lastPageIndex];
  }

  throw new Error('Unknown state!');
};
