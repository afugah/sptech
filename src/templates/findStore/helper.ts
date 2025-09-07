import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';

type Position = { lat: number; lng: number };

export const getCenterOfStores = (storesByCountry: IStore[]): Position => {
  if (!storesByCountry.length) {
    return { lat: 59.3293, lng: 18.0686 };
  }
  const allPositions: Position[] = [];
  storesByCountry.forEach((store) => {
    allPositions.push(store.position);
  });

  const totalPositions = allPositions.length;
  const totalLat = allPositions.reduce((sum, pos) => sum + pos.lat, 0);
  const totalLng = allPositions.reduce((sum, pos) => sum + pos.lng, 0);

  return {
    lat: totalLat / totalPositions,
    lng: totalLng / totalPositions,
  };
};
