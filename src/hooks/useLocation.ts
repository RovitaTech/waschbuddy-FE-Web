import { useState, useCallback } from 'react';
import { Location } from '@/types';

const LOCATION_STORAGE_KEY = 'waschbuddy_selected_location';

function getStoredLocation(): Location | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Location>;
    if (typeof parsed.city !== 'string' || typeof parsed.dorm !== 'string') {
      return null;
    }

    return {
      city: parsed.city,
      dorm: parsed.dorm,
      cityId: typeof parsed.cityId === 'string' ? parsed.cityId : undefined,
      dormId: typeof parsed.dormId === 'string' ? parsed.dormId : undefined,
    };
  } catch {
    return null;
  }
}

export function useLocation() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(() => getStoredLocation());

  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    }
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  return {
    selectedLocation,
    selectLocation,
    clearLocation
  };
}
