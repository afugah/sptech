export interface ICMSStoreAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ICMSStoreLocation {
  latitude: number;
  longitude: number;
}

export interface ICMSStoreOpeningHours {
  schedule: string;
}

export interface ICMSStoreConceptData {
  fullUrl: string;
  metaTitle: string;
  metaDescription: string;
}

export interface ICMSStoreContact {
  phone: string;
}

export interface ICMSStore {
  id: number;
  name: string;
  address: ICMSStoreAddress;
  location: ICMSStoreLocation;
  openingHours: ICMSStoreOpeningHours[];
  contact: ICMSStoreContact;
  storeType: string;
  imageUrl: string;
  slug: string;
  storeCode: string;
  conceptStoreData?: ICMSStoreConceptData;
  status: string;
}

export interface ICMSStoreResponse {
  docs: ICMSStore[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
