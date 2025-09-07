import { type ICommerceStockInventory } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStockInventory';

export interface ICommerceStock {
  id: string;
  quantity: number;
  isAvailable: boolean;
  validateStock: boolean;
  inventories: ICommerceStockInventory[];
}
