export interface IStoreAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IStorePosition {
  lat: number;
  lng: number;
}

export interface IStoreOpeningHours {
  day: string;
  schedule: string;
}

export interface IStoreConceptData {
  fullUrl: string;
  metaTitle: string;
  metaDescription: string;
}

export type StoreType = 'concept store' | 'reseller';

export type CountryCode = 'se' | 'no' | 'fi' | 'es' | 'au' | 'all';

export interface IStore {
  id: number;
  name: string;
  location: string;
  street: string;
  postalNr: string;
  city: string;
  country: string;
  openingHours: string[];
  contact: string;
  type: StoreType;
  imageUrl: string;
  position: IStorePosition;
  slug: string;
  storeCode: string;
  distance?: number;
  fullUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface IStoreFilters {
  country?: string;
  city?: string;
  storeType?: string;
}

export interface IStoreSearchParams extends IStoreFilters {
  query?: string;
}
