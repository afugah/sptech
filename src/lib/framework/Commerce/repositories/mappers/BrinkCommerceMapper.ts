import { type ICommercePrice } from '@/src/lib/framework/Commerce/domain/entities/ICommercePrice';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { type ICommerceStockInventory } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStockInventory';
import { type IBrink } from '@/src/lib/framework/Commerce/types/IBrink';

export class BrinkCommerceMapper {
  public static MapPrice(response: IBrink.PriceResponse): ICommercePrice[] {
    return (
      response.productParent?.productVariants.map<ICommercePrice>((variant) => ({
        id: variant.id,
        basePriceAmount: variant.basePriceAmount,
        salePriceAmount: variant.salePriceAmount,
        discountAmount: variant.discountAmount,
      })) || []
    );
  }

  public static MapStock(response: IBrink.StockResponse): ICommerceStock[] {
    return (
      response.productParent?.productVariants.map<ICommerceStock>((variant) => ({
        id: variant.id,
        quantity: variant.availableQuantity,
        isAvailable: variant.isAvailable,
        validateStock: variant.validateStock,

        inventories: variant.inventories.map<ICommerceStockInventory>((inventory) => ({
          id: inventory.id,
          quantity: inventory.availableQuantity,
          isAvailable: inventory.isAvailable,
        })),
      })) || []
    );
  }
}
