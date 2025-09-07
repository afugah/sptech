'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FixedSizeGrid as Grid } from 'react-window';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import ProductCard from './ProductCard';

interface VirtualizedProductGridProps {
  products: ICollectionItem[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  loadNextPage?: () => Promise<void>;
  onProductClick?: (product: ICollectionItem) => void;
  className?: string;
  // Grid configuration
  columnCount?: number;
  rowHeight?: number;
  itemGap?: number;
  // Container dimensions (required for virtualization)
  width?: number;
  height?: number;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    products: ICollectionItem[];
    columnCount: number;
    itemGap: number;
    onProductClick?: (product: ICollectionItem) => void;
  };
}

const GridItem: React.FC<GridItemProps> = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const { products, columnCount, itemGap, onProductClick } = data;
  const index = rowIndex * columnCount + columnIndex;
  const product = products[index];

  if (!product) {
    return <div style={style} />; // Empty cell
  }

  return (
    <div
      style={{
        ...style,
        padding: `${itemGap / 2}px`,
      }}
    >
      <ProductCard
        product={product}
        onProductClick={onProductClick}
        priority={index < 8} // Prioritize first 8 items
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';

const LoadingGrid: React.FC<{ columnCount: number; rowCount: number; itemGap: number }> = ({
  columnCount,
  rowCount,
  itemGap,
}) => {
  return (
    <div
      className={'grid animate-pulse gap-4'}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: `${itemGap}px`,
      }}
    >
      {Array.from({ length: columnCount * rowCount }).map((_, index) => (
        <div key={index} className={'aspect-[4/5] rounded-lg bg-gray-200'} />
      ))}
    </div>
  );
};

const useResponsiveColumns = () => {
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640)
        setColumnCount(2); // sm
      else if (width < 768)
        setColumnCount(2); // md
      else if (width < 1024)
        setColumnCount(3); // lg
      else if (width < 1280)
        setColumnCount(4); // xl
      else setColumnCount(5); // 2xl+
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columnCount;
};

const useContainerDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 32, // Account for padding
        height: window.innerHeight - 200, // Account for header/footer
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
};

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  isLoading = false,
  hasNextPage = false,
  loadNextPage,
  onProductClick,
  className = '',
  columnCount: propColumnCount,
  rowHeight = 400,
  itemGap = 16,
  width: propWidth,
  height: propHeight,
}) => {
  const responsiveColumnCount = useResponsiveColumns();
  const containerDimensions = useContainerDimensions();

  // Use prop values or responsive/auto-calculated values
  const columnCount = propColumnCount || responsiveColumnCount;
  const width = propWidth || containerDimensions.width;
  const height = propHeight || containerDimensions.height;

  // Calculate grid dimensions
  const rowCount = Math.ceil(products.length / columnCount);
  const columnWidth = (width - (columnCount - 1) * itemGap) / columnCount;

  // Memoize grid data to prevent unnecessary re-renders
  const gridData = useMemo(
    () => ({
      products,
      columnCount,
      itemGap,
      onProductClick,
    }),
    [products, columnCount, itemGap, onProductClick],
  );

  // Intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more data when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && loadNextPage) {
      loadNextPage();
    }
  }, [inView, hasNextPage, isLoading, loadNextPage]);

  // Handle loading state
  if (isLoading && products.length === 0) {
    return (
      <div className={className}>
        <LoadingGrid columnCount={columnCount} rowCount={3} itemGap={itemGap} />
      </div>
    );
  }

  // Handle empty state
  if (!isLoading && products.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center py-16`}>
        <div className={'text-center'}>
          <h3 className={'mb-2 text-lg font-medium text-gray-900'}>No products found</h3>
          <p className={'text-gray-500'}>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Don't render if container dimensions aren't available yet
  if (!width || !height) {
    return (
      <div className={className}>
        <LoadingGrid columnCount={columnCount} rowCount={3} itemGap={itemGap} />
      </div>
    );
  }

  return (
    <div className={className}>
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={width}
        itemData={gridData}
        overscanRowCount={2} // Render 2 extra rows for smoother scrolling
        overscanColumnCount={0}
      >
        {GridItem}
      </Grid>

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className={'flex justify-center py-8'}>
          {isLoading ? (
            <div className={'flex items-center gap-2 text-gray-500'}>
              <div className={'border-current h-4 w-4 animate-spin rounded-full border-2 border-t-transparent'} />
              Loading more products...
            </div>
          ) : (
            <button
              onClick={loadNextPage}
              className={'rounded-lg bg-gray-900 px-6 py-2 text-white transition-colors hover:bg-gray-800'}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VirtualizedProductGrid;
