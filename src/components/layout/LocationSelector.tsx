import { useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { MapPin, Building, Users } from 'lucide-react';
import { filterDataByLocation, mockMachines, mockUsers } from '@/dummy-data';
import { CITIES_AND_DORMS } from '@/constants';

interface LocationSelectorProps {
  onLocationSelect: (location: { city: string; dorm: string | 'all' }) => void;
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

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDorm, setSelectedDorm] = useState<string>('');

  // Generate cities from actual data
  const cities: City[] = Object.entries(CITIES_AND_DORMS).map(([cityName, dorms]) => ({
    id: cityName,
    name: cityName,
    country: 'Germany',
    dormCount: dorms.length
  }));

  // Generate dorms from actual data with real counts
  const getDormsForCity = (cityId: string): Dorm[] => {
    const dormsInCity = CITIES_AND_DORMS[cityId as keyof typeof CITIES_AND_DORMS] || [];
    return dormsInCity.map((dormName, index) => {
      const machines = filterDataByLocation(mockMachines, { city: cityId, dorm: dormName });
      const users = filterDataByLocation(mockUsers, { city: cityId, dorm: dormName });
      return {
        id: `${cityId.toLowerCase()}-${index + 1}`,
        name: dormName,
        cityId: cityId,
        address: `Sample Address ${index + 1}`,
        machineCount: machines.length,
        userCount: users.length
      };
    });
  };

  const selectedCityData = cities.find(city => city.id === selectedCity);
  const availableDorms = selectedCity ? getDormsForCity(selectedCity) : [];

  const handleContinue = () => {
    if (selectedCity) {
      let dormName = 'all';
      if (selectedDorm && selectedDorm !== 'all') {
        const selectedDormData = availableDorms.find(d => d.id === selectedDorm);
        dormName = selectedDormData?.name || 'all';
      }
      
      onLocationSelect({
        city: selectedCity,
        dorm: dormName
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/waschbuddy-logo.svg"
              alt="WASCHBUDDY logo"
              width={56}
              height={56}
              className="h-14 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Select Your Location</CardTitle>
          <CardDescription>
            Choose the city and dormitory you want to manage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* City Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">City</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{city.name}, {city.country}</span>
                      <Badge variant="secondary" className="ml-2">
                        {city.dormCount} dorms
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Info */}
          {selectedCityData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{selectedCityData.name}, {selectedCityData.country}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCityData.dormCount} dormitories available in this city
              </p>
            </div>
          )}

          {/* Dorm Selection */}
          {selectedCity && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Dormitory</label>
              <Select value={selectedDorm} onValueChange={setSelectedDorm}>
                <SelectTrigger>
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select a dormitory or view all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>All Dormitories</span>
                      <Badge variant="outline" className="ml-2">
                        View all data
                      </Badge>
                    </div>
                  </SelectItem>
                  {availableDorms.map((dorm) => (
                    <SelectItem key={dorm.id} value={dorm.id}>
                      <div className="flex flex-col items-start">
                        <span>{dorm.name}</span>
                        <span className="text-xs text-muted-foreground">{dorm.address}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dorm Info */}
          {selectedDorm && selectedDorm !== 'all' && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              {(() => {
                const dorm = availableDorms.find(d => d.id === selectedDorm);
                if (!dorm) return null;
                return (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{dorm.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{dorm.address}</p>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{dorm.machineCount}</span>
                        <span className="text-muted-foreground">machines</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{dorm.userCount}</span>
                        <span className="text-muted-foreground">users</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* All Dorms Summary */}
          {selectedDorm === 'all' && selectedCity && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="h-4 w-4 text-purple-600" />
                <span className="font-medium">All Dormitories in {selectedCityData?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">
                    {availableDorms.reduce((sum, dorm) => sum + dorm.machineCount, 0)}
                  </span>
                  <span className="text-muted-foreground"> total machines</span>
                </div>
                <div>
                  <span className="font-medium">
                    {availableDorms.reduce((sum, dorm) => sum + dorm.userCount, 0)}
                  </span>
                  <span className="text-muted-foreground"> total users</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleContinue} 
            className="w-full" 
            disabled={!selectedCity}
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}