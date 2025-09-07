import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';

export interface IStock {
  name: string;
  size: Array<{ size: string; stockQuantity: number; isAvailable: boolean }>;
  warehouseInfo?: IWarehouseInfo;
}

export interface IWarehouseInfo {
  id: number;
  externalId: string;
  title: string;
  city: string;
  streetAddress: string;
  postalCode: string;
  country: string;
}

export const getStocksFromCommerceStock = (
  availableStocks: ICommerceStock[],
  variants: IProductVariant[],
  w?: IElasticSearch.WareHousesSuccessResponse,
): IStock[] => {
  const filteredStocks = availableStocks.filter((stockItem) =>
    variants.some((variant) => variant.sku === stockItem.id),
  );
  const warehouses = w?.hits?.hits;
  return filteredStocks.reduce((acc: IStock[], stockItem) => {
    const { id: stockId, inventories } = stockItem;

    const variant = variants.find((v) => v.sku === stockId);
    const variantSize = variant ? variant.variant : stockId;

    inventories.forEach((inventory) => {
      const warehouse = warehouses?.find((w) => w._source?.externalId === inventory.id);
      const existingInventory = acc.find((i) => i.name === inventory.id);

      if (existingInventory) {
        const existingSize = existingInventory.size.find((s) => s.size === variantSize);

        if (existingSize) {
          existingSize.stockQuantity += inventory.quantity;
        } else {
          existingInventory.size.push({
            size: variantSize,
            stockQuantity: inventory.quantity,
            isAvailable: inventory.isAvailable,
          });
        }
      } else {
        acc.push({
          name: inventory.id,
          size: [
            {
              size: variantSize,
              stockQuantity: inventory.quantity,
              isAvailable: inventory.isAvailable,
            },
          ],
          warehouseInfo: warehouse?._source
            ? {
                id: warehouse._source.id,
                externalId: warehouse._source.externalId,
                title: warehouse._source.title,
                city: warehouse._source.city,
                streetAddress: warehouse._source.streetAddress,
                postalCode: warehouse._source.postalCode,
                country: warehouse._source.country,
              }
            : undefined,
        });
      }
    });

    return acc;
  }, []);
};

export async function getAvailableStock(productId: string, countryCode: string) {
  try {
    const response = await fetch(`/api/stock/get-store-stock?productId=${productId}&countryCode=${countryCode}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error fetching stock: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error in getAvailableStock:', error);
    throw error;
  }
}
export async function getWarehouses() {
  try {
    const response = await fetch(`/api/warehouse/get-warehouse`, {
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching available stock:', error);
  }
}
