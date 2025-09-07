import classNames from 'classnames';
import ProductCard from '@/src/components/product/ProductCard';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

interface IProductGridStaticProps {
  productList: ICollectionItem[];
  className?: string;
}

export const ProductGridStatic: React.FC<IProductGridStaticProps> = ({ productList, className }) => (
  <div
    className={classNames(
      'mb-12 grid grid-flow-row-dense auto-rows-fr grid-cols-2 gap-3 px-4 md:px-8 lg:grid-cols-4 lg:gap-6',

      className,
    )}
  >
    {productList.map((product) => (
      <ProductCard key={product.key} product={product} />
    ))}
  </div>
);
