import { usePaginationRange } from './usePaginationRange';

describe('usePaginationRange', () => {
  describe('default sibling count', () => {
    test('Case 1: All pages visible;', () => {
      expect(usePaginationRange({ currentPage: 1, totalPages: 1 })).toStrictEqual([1]);
      expect(usePaginationRange({ currentPage: 1, totalPages: 2 })).toStrictEqual([1, 2]);
      expect(usePaginationRange({ currentPage: 1, totalPages: 3 })).toStrictEqual([1, 2, 3]);
      expect(usePaginationRange({ currentPage: 1, totalPages: 4 })).toStrictEqual([1, 2, 3, 4]);
      expect(usePaginationRange({ currentPage: 1, totalPages: 5 })).toStrictEqual([1, 2, 3, 4, 5]);

      expect(usePaginationRange({ currentPage: 1, totalPages: 6 })).not.toStrictEqual([1, 2, 3, 4, 5, 6]);
    });

    test('Case 2: No left dots; Has right dots;', () => {
      expect(usePaginationRange({ currentPage: 1, totalPages: 6 })).toStrictEqual([1, 2, '...', 6]);
      expect(usePaginationRange({ currentPage: 1, totalPages: 20 })).toStrictEqual([1, 2, '...', 20]);
      expect(usePaginationRange({ currentPage: 2, totalPages: 20 })).toStrictEqual([1, 2, 3, '...', 20]);
      expect(usePaginationRange({ currentPage: 3, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, '...', 20]);
    });

    test('Case 3: Has left dots; No right dots;', () => {
      expect(usePaginationRange({ currentPage: 20, totalPages: 20 })).toStrictEqual([1, '...', 19, 20]);
      expect(usePaginationRange({ currentPage: 19, totalPages: 20 })).toStrictEqual([1, '...', 18, 19, 20]);
      expect(usePaginationRange({ currentPage: 18, totalPages: 20 })).toStrictEqual([1, '...', 17, 18, 19, 20]);
    });

    test('Case 4: Has left dots; Has right dots;', () => {
      expect(usePaginationRange({ currentPage: 5, totalPages: 20 })).toStrictEqual([1, '...', 4, 5, 6, '...', 20]);
      expect(usePaginationRange({ currentPage: 17, totalPages: 20 })).toStrictEqual([1, '...', 16, 17, 18, '...', 20]);
      expect(usePaginationRange({ currentPage: 4, totalPages: 7 })).toStrictEqual([1, '...', 3, 4, 5, '...', 7]);
    });
  });

  describe('three siblings', () => {
    const useThree = (params: Parameters<typeof usePaginationRange>[0]) =>
      usePaginationRange({ ...params, siblingCount: 3 });

    test('Case 1: All pages visible;', () => {
      expect(useThree({ currentPage: 1, totalPages: 1 })).toStrictEqual([1]);
      expect(useThree({ currentPage: 1, totalPages: 2 })).toStrictEqual([1, 2]);
      expect(useThree({ currentPage: 1, totalPages: 3 })).toStrictEqual([1, 2, 3]);
      expect(useThree({ currentPage: 1, totalPages: 4 })).toStrictEqual([1, 2, 3, 4]);
      expect(useThree({ currentPage: 1, totalPages: 5 })).toStrictEqual([1, 2, 3, 4, 5]);
      expect(useThree({ currentPage: 1, totalPages: 6 })).toStrictEqual([1, 2, 3, 4, 5, 6]);
      expect(useThree({ currentPage: 1, totalPages: 7 })).toStrictEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(useThree({ currentPage: 1, totalPages: 8 })).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(useThree({ currentPage: 1, totalPages: 9 })).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

      expect(useThree({ currentPage: 1, totalPages: 10 })).not.toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    test('Case 2: No left dots; Has right dots;', () => {
      expect(useThree({ currentPage: 1, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, '...', 20]);
      expect(useThree({ currentPage: 2, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, 5, '...', 20]);
      expect(useThree({ currentPage: 3, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, 5, 6, '...', 20]);
      expect(useThree({ currentPage: 4, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, 5, 6, 7, '...', 20]);
      expect(useThree({ currentPage: 5, totalPages: 20 })).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, '...', 20]);

      expect(useThree({ currentPage: 6, totalPages: 20 })).not.toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, '...', 20]);
    });

    test('Case 3: Has left dots; No right dots;', () => {
      expect(useThree({ currentPage: 20, totalPages: 20 })).toStrictEqual([1, '...', 17, 18, 19, 20]);
      expect(useThree({ currentPage: 19, totalPages: 20 })).toStrictEqual([1, '...', 16, 17, 18, 19, 20]);
      expect(useThree({ currentPage: 18, totalPages: 20 })).toStrictEqual([1, '...', 15, 16, 17, 18, 19, 20]);
      expect(useThree({ currentPage: 17, totalPages: 20 })).toStrictEqual([1, '...', 14, 15, 16, 17, 18, 19, 20]);
      expect(useThree({ currentPage: 16, totalPages: 20 })).toStrictEqual([1, '...', 13, 14, 15, 16, 17, 18, 19, 20]);

      expect(useThree({ currentPage: 15, totalPages: 20 })).not.toStrictEqual([
        1,
        '...',
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
      ]);
    });

    test('Case 4: Has left dots; Has right dots;', () => {
      expect(useThree({ currentPage: 6, totalPages: 20 })).toStrictEqual([1, '...', 3, 4, 5, 6, 7, 8, 9, '...', 20]);
      expect(useThree({ currentPage: 15, totalPages: 20 })).toStrictEqual([
        1,
        '...',
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        '...',
        20,
      ]);
    });
  });

  test('custom symbol', () => {
    expect(usePaginationRange({ currentPage: 1, totalPages: 6, dotsSymbol: '---' })).toStrictEqual([1, 2, '---', 6]);
    expect(usePaginationRange({ currentPage: 1, totalPages: 6, dotsSymbol: '"' })).toStrictEqual([1, 2, '"', 6]);
  });
});
