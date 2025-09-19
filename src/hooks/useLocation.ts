import { useState, useCallback } from 'react';
import { Location } from '@/types';

export function useLocation() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return {
    selectedLocation,
    selectLocation,
    clearLocation
  };
}
