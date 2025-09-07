import { type IStore, type IStoreFilters, type StoreType } from '../domain/entities/IStore';
import { type IStoreRepository } from '../domain/IStoreRepository';
import { type ICMSStoreResponse } from '../types/ICMS';

export class StoreRepository implements IStoreRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.CMS_API_URL || 'http://localhost:3500';
  }

  async getStores(filters: IStoreFilters = {}): Promise<{ [country: string]: IStore[] }> {
    const params = new URLSearchParams();

    if (filters.country && filters.country !== 'all') {
      const countryName = this.getCountryName(filters.country);
      if (countryName) {
        params.append('where[address.country][equals]', countryName);
      }
    }

    if (filters.city) {
      params.append('where[address.city][contains]', filters.city);
    }

    if (filters.storeType && filters.storeType !== 'all') {
      params.append('where[storeType][equals]', filters.storeType);
    }

    params.append('where[status][equals]', 'active');

    const response = await fetch(`${this.baseUrl}/api/stores?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS API returned ${response.status}`);
    }

    const data: ICMSStoreResponse = await response.json();

    const transformedStores = data.docs.map((store) => this.transformStore(store));

    const groupedStores: { [country: string]: IStore[] } = {};

    transformedStores.forEach((store) => {
      const countryKey = this.getCountryKey(store.country);
      if (!groupedStores[countryKey]) {
        groupedStores[countryKey] = [];
      }
      groupedStores[countryKey].push(store);
    });

    return groupedStores;
  }

  async getStoresByCountry(country: string): Promise<IStore[]> {
    const stores = await this.getStores({ country });
    return stores[country] || [];
  }

  async getStoreById(id: number): Promise<IStore | null> {
    const allStores = await this.getStores();

    for (const countryStores of Object.values(allStores)) {
      const store = countryStores.find((s) => s.id === id);
      if (store) {
        return store;
      }
    }

    return null;
  }

  async searchStores(query: string): Promise<IStore[]> {
    const allStores = await this.getStores();
    const results: IStore[] = [];

    const searchTerm = query.toLowerCase();

    Object.values(allStores).forEach((countryStores) => {
      countryStores.forEach((store) => {
        if (
          store.name.toLowerCase().includes(searchTerm) ||
          store.city.toLowerCase().includes(searchTerm) ||
          store.street.toLowerCase().includes(searchTerm)
        ) {
          results.push(store);
        }
      });
    });

    return results;
  }

  private transformStore(cmsStore: ICMSStoreResponse['docs'][0]): IStore {
    const store: IStore = {
      id: cmsStore.id,
      name: cmsStore.name,
      location: cmsStore.address.city,
      street: cmsStore.address.street,
      postalNr: cmsStore.address.postalCode,
      city: cmsStore.address.city,
      country: cmsStore.address.country,
      openingHours: cmsStore.openingHours?.map((h) => h.schedule) || [],
      contact: cmsStore.contact?.phone || '',
      type: cmsStore.storeType as StoreType,
      imageUrl:
        cmsStore.imageUrl ||
        'https://cdn.sanity.io/images/kkdykxo2/production/2b81174a089782098eac27c70c680a99e5a0ecac-1296x864.jpg?w=1920&q=75&auto=format',
      position: {
        lat: cmsStore.location?.latitude || 0,
        lng: cmsStore.location?.longitude || 0,
      },
      slug: cmsStore.slug,
      storeCode: cmsStore.storeCode,
    };

    if (cmsStore.storeType === 'concept store' && cmsStore.conceptStoreData) {
      store.fullUrl = cmsStore.conceptStoreData.fullUrl;
      store.metaTitle = cmsStore.conceptStoreData.metaTitle;
      store.metaDescription = cmsStore.conceptStoreData.metaDescription;
    }

    return store;
  }

  private getCountryName(countryCode: string): string | null {
    const countryCodeToName: { [key: string]: string } = {
      se: 'Sverige',
      no: 'Norge',
      fi: 'Finland',
      es: 'Spanien',
      uk: 'Storbritannien',
      nz: 'Nya Zeeland',
      au: 'Australien',
      ax: 'Åland',
      us: 'USA',
      pr: 'Puerto Rico',
    };

    return countryCodeToName[countryCode] || null;
  }

  private getCountryKey(country: string): string {
    const countryMap: { [key: string]: string } = {
      Sverige: 'se',
      Norway: 'no',
      Norge: 'no',
      Finland: 'fi',
      Spain: 'es',
      Spanien: 'es',
      Storbritannien: 'uk',
      'United Kingdom': 'uk',
      'Nya Zeeland': 'nz',
      'New Zealand': 'nz',
      Australien: 'au',
      Australia: 'au',
      Åland: 'ax',
      USA: 'us',
      'Puerto Rico': 'pr',
    };

    return countryMap[country] || 'other';
  }
}
