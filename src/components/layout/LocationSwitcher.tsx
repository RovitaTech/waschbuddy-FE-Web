import { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { filterDataByLocation, mockMachines, mockUsers } from '@/dummy-data';
import { CITIES_AND_DORMS } from '@/constants';
import { overviewService } from '@/lib/api';
import { ClientDorm } from '@/lib/api/types';
import { Location } from '@/types';

interface LocationSwitcherProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
  onBackToLocationSelect: () => void;
}

export function LocationSwitcher({ currentLocation, onLocationChange, onBackToLocationSelect }: LocationSwitcherProps) {
  const [apiDorms, setApiDorms] = useState<ClientDorm[]>([]);
  const [isLoadingDorms, setIsLoadingDorms] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadDorms = async () => {
      if (!currentLocation.cityId) {
        setApiDorms([]);
        return;
      }

      try {
        setIsLoadingDorms(true);
        const dorms = await overviewService.getDorms({ cityId: currentLocation.cityId });
        if (isActive) {
          setApiDorms(dorms);
        }
      } catch {
        if (isActive) {
          setApiDorms([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingDorms(false);
        }
      }
    };

    void loadDorms();

    return () => {
      isActive = false;
    };
  }, [currentLocation.cityId]);

  const fallbackDorms = CITIES_AND_DORMS[currentLocation.city as keyof typeof CITIES_AND_DORMS] || [];
  const availableDorms = apiDorms.length > 0
    ? apiDorms.map((dorm) => ({
        id: dorm.id,
        name: dorm.name,
        machineCount: dorm.machineCount ?? 0,
        userCount: dorm.userCount ?? 0,
      }))
    : fallbackDorms.map((dormName) => ({
        id: dormName,
        name: dormName,
        machineCount: 0,
        userCount: 0,
      }));
  
  // Get total counts for "All Dormitories" option
  const allCityMachines = filterDataByLocation(mockMachines, { city: currentLocation.city, dorm: 'all' });
  const allCityUsers = filterDataByLocation(mockUsers, { city: currentLocation.city, dorm: 'all' });

  const handleDormChange = useCallback((dormValue: string) => {
    const selectedDorm = availableDorms.find((dorm) => dorm.name === dormValue);

    onLocationChange({
      city: currentLocation.city,
      dorm: dormValue,
      cityId: currentLocation.cityId,
      dormId: dormValue === 'all' ? undefined : selectedDorm?.id,
    });
  }, [availableDorms, currentLocation.city, currentLocation.cityId, onLocationChange]);

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onBackToLocationSelect}
        className="hidden sm:flex"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Change City
      </Button>
      
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{currentLocation.city}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <Select value={currentLocation.dorm} onValueChange={handleDormChange}>
          <SelectTrigger className="w-48 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex flex-col items-start">
                <span className="text-sm">All Dormitories</span>
                <span className="text-xs text-muted-foreground">
                  {allCityMachines.length} machines • {allCityUsers.length} users • {availableDorms.length} dorms
                </span>
              </div>
            </SelectItem>
            {isLoadingDorms && (
              <SelectItem value="__loading_dorms__" disabled>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading dorms...
                </div>
              </SelectItem>
            )}
            {!isLoadingDorms && availableDorms.length === 0 && (
              <SelectItem value="__no_dorms__" disabled>
                No dorm available
              </SelectItem>
            )}
            {availableDorms.map((dorm, index) => {
              const dormMachines = filterDataByLocation(mockMachines, { city: currentLocation.city, dorm: dorm.name });
              const dormUsers = filterDataByLocation(mockUsers, { city: currentLocation.city, dorm: dorm.name });
              return (
                <SelectItem key={`${currentLocation.city}-${dorm.id}-${index}`} value={dorm.name}>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{dorm.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {dormMachines.length} machines • {dormUsers.length} users
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile version */}
      <Button
        variant="outline"
        size="sm"
        onClick={onBackToLocationSelect}
        className="sm:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}