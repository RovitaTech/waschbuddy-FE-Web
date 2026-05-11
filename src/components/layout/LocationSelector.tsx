import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { AlertCircle, Building, Loader2, MapPin, Users } from 'lucide-react';
import { overviewService } from '@/lib/api';
import { ClientCity, ClientDorm } from '@/lib/api/types';
import { Location } from '@/types';

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const NO_CITY_VALUE = '__no_city_available__';
  const NO_DORM_VALUE = '__no_dorm_available__';

  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDorm, setSelectedDorm] = useState<string>('');
  const [cities, setCities] = useState<ClientCity[]>([]);
  const [availableDorms, setAvailableDorms] = useState<ClientDorm[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingDorms, setIsLoadingDorms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        setErrorMessage(null);
        const cityData = await overviewService.getCities();
        if (isActive) setCities(cityData);
      } catch {
        if (isActive) setErrorMessage('Unable to load cities. Please try again.');
      } finally {
        if (isActive) setIsLoadingCities(false);
      }
    };

    loadCities();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadDorms = async () => {
      if (!selectedCity) {
        setAvailableDorms([]);
        return;
      }

      try {
        setIsLoadingDorms(true);
        setErrorMessage(null);
        const dormData = await overviewService.getDorms({ cityId: selectedCity });
        if (isActive) setAvailableDorms(dormData);
      } catch {
        if (isActive) {
          setAvailableDorms([]);
          setErrorMessage('Unable to load dormitories for this city. Please try again.');
        }
      } finally {
        if (isActive) setIsLoadingDorms(false);
      }
    };

    loadDorms();

    return () => {
      isActive = false;
    };
  }, [selectedCity]);

  const selectedCityData = cities.find(city => (city.id || city.name) === selectedCity);
  const getDormSelectValue = (dorm: ClientDorm, index: number) => `${dorm.id || dorm.name}-${index}`;
  const selectedDormData = availableDorms.find((dorm, index) => getDormSelectValue(dorm, index) === selectedDorm);
  const hasCities = cities.length > 0;
  const hasDorms = availableDorms.length > 0;

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDorm('');
  };

  const handleContinue = () => {
    if (!selectedCityData) return;

    const dormName = selectedDormData?.name ?? 'all';

    onLocationSelect({
      city: selectedCityData.name,
      dorm: dormName,
      cityId: selectedCityData.id,
      dormId: selectedDormData?.id
    });
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
              className="h-14 w-14"
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
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={isLoadingCities || !hasCities}
            >
              <SelectTrigger>
                {isLoadingCities ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                <SelectValue
                  placeholder={
                    isLoadingCities
                      ? 'Loading cities...'
                      : hasCities
                        ? 'Select a city'
                        : 'No city available'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {hasCities ? (
                  cities.map((city, index) => {
                    const cityId = city.id || city.name;

                    return (
                      <SelectItem key={`${cityId}-${index}`} value={cityId}>
                        <div className="flex items-center justify-between w-full">
                          <span>{city.name}, {city.country?.name ?? city.country?.code ?? 'Unknown country'}</span>
                          <Badge variant="secondary" className="ml-2">
                            {city.dormCount} dorms
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value={NO_CITY_VALUE} disabled>
                    No city available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* City Info */}
          {selectedCityData && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {selectedCityData.name}, {selectedCityData.country?.name ?? selectedCityData.country?.code ?? 'Unknown country'}
                </span>
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
              <Select
                value={selectedDorm}
                onValueChange={setSelectedDorm}
                disabled={isLoadingDorms || !hasDorms}
              >
                <SelectTrigger>
                  {isLoadingDorms ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Building className="h-4 w-4 mr-2" />
                  )}
                  {selectedDormData ? (
                    <span className="truncate">
                      {selectedDormData.name}
                      {selectedDormData.address ? `, ${selectedDormData.address}` : ''}
                    </span>
                  ) : selectedDorm === 'all' ? (
                    <span>All Dormitories</span>
                  ) : (
                    <SelectValue
                      placeholder={
                        isLoadingDorms
                          ? 'Loading dormitories...'
                          : hasDorms
                            ? 'Select a dormitory or view all'
                            : 'No dorm available'
                      }
                    />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {hasDorms ? (
                    <>
                      <SelectItem value="all">
                        <div className="flex items-center justify-between w-full">
                          <span>All Dormitories</span>
                          <Badge variant="outline" className="ml-2">
                            View all data
                          </Badge>
                        </div>
                      </SelectItem>
                      {availableDorms.map((dorm, index) => {
                        const dormId = getDormSelectValue(dorm, index);

                        return (
                          <SelectItem key={dormId} value={dormId}>
                            <div className="flex flex-col items-start">
                              <span>{dorm.name}</span>
                              {dorm.address && (
                                <span className="text-xs text-muted-foreground">{dorm.address}</span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </>
                  ) : (
                    <SelectItem value={NO_DORM_VALUE} disabled>
                      No dorm available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dorm Info */}
          {selectedDorm && selectedDorm !== 'all' && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              {(() => {
                const dorm = selectedDormData;
                if (!dorm) return null;
                return (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {dorm.name}
                        {dorm.address ? `, ${dorm.address}` : ''}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{dorm.machineCount ?? 0}</span>
                        <span className="text-muted-foreground">machines</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{dorm.userCount ?? 0}</span>
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
                    {availableDorms.reduce((sum, dorm) => sum + (dorm.machineCount ?? 0), 0)}
                  </span>
                  <span className="text-muted-foreground"> total machines</span>
                </div>
                <div>
                  <span className="font-medium">
                    {availableDorms.reduce((sum, dorm) => sum + (dorm.userCount ?? 0), 0)}
                  </span>
                  <span className="text-muted-foreground"> total users</span>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button 
            onClick={handleContinue} 
            className="w-full" 
            disabled={!selectedCityData || isLoadingCities || isLoadingDorms}
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
