import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { MapPin, Building, ArrowLeft } from 'lucide-react';
import { filterDataByLocation, mockMachines, mockUsers } from '@/dummy-data';
import { CITIES_AND_DORMS } from '@/constants';

interface LocationSwitcherProps {
  currentLocation: { city: string; dorm: string | 'all' };
  onLocationChange: (location: { city: string; dorm: string | 'all' }) => void;
  onBackToLocationSelect: () => void;
}

interface City {
  id: string;
  name: string;
  country: string;
  dormCount: number;
}

interface Dorm {
  id: string;
  name: string;
  cityId: string;
  address: string;
  machineCount: number;
  userCount: number;
}

export function LocationSwitcher({ currentLocation, onLocationChange, onBackToLocationSelect }: LocationSwitcherProps) {
  // Get available dorms for current city from the same data source
  const availableDorms = CITIES_AND_DORMS[currentLocation.city as keyof typeof CITIES_AND_DORMS] || [];
  
  // Get total counts for "All Dormitories" option
  const allCityMachines = filterDataByLocation(mockMachines, { city: currentLocation.city, dorm: 'all' });
  const allCityUsers = filterDataByLocation(mockUsers, { city: currentLocation.city, dorm: 'all' });

  const handleDormChange = useCallback((dormValue: string) => {
    onLocationChange({
      city: currentLocation.city,
      dorm: dormValue
    });
  }, [currentLocation.city, onLocationChange]);

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
            {availableDorms.map((dorm, index) => {
              const dormMachines = filterDataByLocation(mockMachines, { city: currentLocation.city, dorm });
              const dormUsers = filterDataByLocation(mockUsers, { city: currentLocation.city, dorm });
              return (
                <SelectItem key={`${currentLocation.city}-${dorm}-${index}`} value={dorm}>
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{dorm}</span>
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