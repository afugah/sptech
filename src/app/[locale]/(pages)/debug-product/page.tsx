import { fetchPageDataSafe } from '@/src/lib/storyblok/fetchPageDataSafe';

interface DebugProductPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DebugProductPage({ params }: DebugProductPageProps) {
  const { locale } = await params;
  const slug = 'p/love-knot-necklace-silver';

  const { product } = await fetchPageDataSafe(locale, slug);

  return (
    <div className={'container mx-auto py-8'}>
      <h1 className={'mb-4 text-2xl font-bold'}>Product Debug Page</h1>

      <div className={'bg-gray-100 mb-4 rounded p-4'}>
        <h2 className={'mb-2 text-xl font-semibold'}>Server-side product data:</h2>
        <pre className={'overflow-x-auto text-xs'}>
          {JSON.stringify(
            {
              id: product?.id,
              sku: product?.sku,
              title: product?.title,
              material: product?.material,
              productColors: product?.productColors,
              productGroupProducts: product?.productGroupProducts,
              productColorsLength: product?.productColors?.length,
              productGroupProductsLength: product?.productGroupProducts?.length,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className={'bg-yellow-100 rounded p-4'}>
        <h2 className={'mb-2 text-xl font-semibold'}>Analysis:</h2>
        <p>Product ID: {product?.id || 'Not found'}</p>
        <p>Product Colors: {product?.productColors?.length || 0} items</p>
        <p>Product Group Products: {product?.productGroupProducts?.length || 0} items</p>

        {product?.productColors?.length ? (
          <div>
            <h3 className={'mt-2 font-semibold'}>Product Colors SKUs:</h3>
            <ul>
              {product.productColors.map((color, index) => (
                <li key={index}>
                  {color.sku} - {color.title}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={'text-red-600'}>No product colors found!</p>
        )}
      </div>
    </div>
  );
}
