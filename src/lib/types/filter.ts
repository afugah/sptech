export interface SubCategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  category: string;
  subCategories: SubCategory[];
}

export interface FilterValue {
  name: string;
  value: string;
  count: number;
  children?: FilterValue[] | null;
  selected: boolean;
  has_children: boolean;
  from?: number | null;
  to?: number | null;
}

export interface FilterRequestValues {
  item_group_id: string[];
  brand: string[];
  color: string[];
  size: string[];
  category: [];
  price: {
    min: number;
    max: number;
  };
  quantity: string[];
  availability: string[];
}
