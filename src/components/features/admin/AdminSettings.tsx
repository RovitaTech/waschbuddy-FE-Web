import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { CITIES_AND_DORMS } from '@/constants';
import { settingsService, overviewService } from '@/lib/api';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { 
  Globe, 
  Mail, 
  Database, 
  Settings2,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettingsProps {
  location: { city: string; dorm: string | 'all'; cityId?: string; dormId?: string };
}

type SettingsSource = {
  maxReservationTime?: number;
  cleaningInterval?: number;
  startTime?: string;
  endTime?: string;
  maxQueues?: number;
  maxFutureReservationDays?: number;
  maintenanceMode?: boolean;
  autoApproveUsers?: boolean;
  cancellationWindow?: number;
  reservationPrice?: number;
};

type SettingsApiResponse = {
  settings?: SettingsSource & {
    citySpecificSettings?: Record<string, SettingsSource>;
    dormSpecificSettings?: Record<string, SettingsSource>;
  };
  city?: { id: string };
  citySettings?: SettingsSource;
  dormSpecificSettings?: Record<string, SettingsSource>;
};

const resolveSettingsScope = (
  response: SettingsApiResponse | null,
  location: AdminSettingsProps['location']
): SettingsSource | null => {
  if (!response) return null;

  const globalSettings = response.settings ?? null;
  const responseCity = response.city?.id;

  if (location.dormId) {
    return (
      response.dormSpecificSettings?.[location.dormId] ??
      globalSettings?.dormSpecificSettings?.[location.dormId] ??
      globalSettings
    ) as SettingsSource | null;
  }

  if (location.cityId || responseCity) {
    const cityId = location.cityId || responseCity;
    return (
      response.citySpecificSettings?.[cityId] ??
      globalSettings?.citySpecificSettings?.[cityId] ??
      response.citySettings ??
      globalSettings
    ) as SettingsSource | null;
  }

  return globalSettings;
};

const applyResolvedSettings = (
  prev: any,
  source: SettingsSource | null | undefined,
  location: AdminSettingsProps['location']
) => ({
  ...prev,
  system: {
    ...prev.system,
    maintenanceMode: source?.maintenanceMode ?? prev.system.maintenanceMode,
    autoApproveUsers: source?.autoApproveUsers ?? prev.system.autoApproveUsers,
    maxReservationTime: String(source?.maxReservationTime ?? prev.system.maxReservationTime),
    cleaningInterval: String(source?.cleaningInterval ?? prev.system.cleaningInterval),
    maintenanceNotice: {
      ...prev.system.maintenanceNotice,
      cityId: location.cityId ?? prev.system.maintenanceNotice.cityId,
      allDormsInCity: location.dorm === 'all',
      dormIds: location.dorm === 'all'
        ? []
        : location.dormId
          ? [location.dormId]
          : prev.system.maintenanceNotice.dormIds,
    },
  },
  business: {
    ...prev.business,
    maxFutureReservationDays: String(source?.maxFutureReservationDays ?? prev.business.maxFutureReservationDays),
    maxNumberOfQueues: String(source?.maxQueues ?? prev.business.maxNumberOfQueues),
    cancellationWindow: String(source?.cancellationWindow ?? prev.business.cancellationWindow),
    reservationPrice: String(source?.reservationPrice ?? prev.business.reservationPrice),
    operatingHours: {
      start: source?.startTime ?? prev.business.operatingHours.start,
      end: source?.endTime ?? prev.business.operatingHours.end,
    }
  }
});

export function AdminSettings({ location }: AdminSettingsProps) {
  // Settings state from API
  const [apiSettings, setApiSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Cities and dorms from API
  const [cities, setCities] = useState<any[]>([]);
  const [allDorms, setAllDorms] = useState<any[]>([]);
  const [isLoadingCitiesDorms, setIsLoadingCitiesDorms] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const todayDate = getTodayDate();
  
  // Local UI state
  const [settings, setSettings] = useState({
    system: {
      maintenanceMode: false,
      autoApproveUsers: false,
      maxReservationTime: '60',
      cleaningInterval: '15',
      maintenanceNotice: {
        title: 'Maintenance Notice',
        message: 'System will be under maintenance from 2 AM to 4 AM today.',
        startTime: '09:00',
        endTime: '23:00',
        startDate: todayDate,
        endDate: todayDate,
        cityId: location.city,
        allDormsInCity: location.dorm === 'all',
        dormIds: location.dorm === 'all' ? [] : [location.dorm]
      }
    },
    business: {
      reservationPrice: '2.50',
      cancellationWindow: '15',
      maxFutureReservationDays: '0',
      maxNumberOfQueues: '1',
      operatingHours: {
        start: '06:00',
        end: '23:00'
      }
    }
  });

  const [customMessage, setCustomMessage] = useState('');
  const [systemMessageGlobal, setSystemMessageGlobal] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMaxReservationAlert, setShowMaxReservationAlert] = useState(false);

  // Load cities when maintenance mode is enabled (not on mount)
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCitiesDorms(true);
        const citiesData = await overviewService.getCities();
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Failed to load cities');
      } finally {
        setIsLoadingCitiesDorms(false);
      }
    };

    if (settings.system.maintenanceMode) {
      loadCities();
    } else {
      // Clear previously loaded cities/dorms when maintenance is turned off
      setCities([]);
      setAllDorms([]);
    }
  }, [settings.system.maintenanceMode]);

  // Load settings on mount and when location changes
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        setSettingsError(null);
        // If a dorm is selected, load dorm-specific settings (do not send cityId)
        let data: any = null;
        if (location.dormId) {
          // Request dorm settings using query param: /clients/settings?dormId=...
          data = await settingsService.getAllSettings(undefined, location.dormId);
        } else {
          data = await settingsService.getAllSettings(location.cityId);
        }
        setApiSettings(data);

        const resolvedSettings = resolveSettingsScope(data, location);
        
        if (resolvedSettings) {
          setSettings(prev => applyResolvedSettings(prev, resolvedSettings, location));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettingsError('Failed to load settings. Using defaults.');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    if (location.cityId) {
      loadSettings();
    }
  }, [location.cityId, location.dormId]);

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleMaxFutureReservationChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue > 7) {
      setShowMaxReservationAlert(true);
      return;
    }
    handleSettingChange('business', 'maxFutureReservationDays', value);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const ensureTimeWithSeconds = (t: string) => {
        if (!t) return t;
        // if already has seconds
        if (t.split(':').length === 3) return t;
        return t.length >= 5 ? `${t.slice(0,5)}:00` : t;
      };

      const payload: any = {
        maxReservationTime: parseInt(settings.system.maxReservationTime),
        cleaningInterval: parseInt(settings.system.cleaningInterval),
        maxFutureReservationDays: parseInt(settings.business.maxFutureReservationDays),
        maxQueues: parseInt(settings.business.maxNumberOfQueues),
        // Note: backend rejects `cancellationWindow` — do not send it
        // Ensure API-friendly time format "HH:MM:SS"
        startTime: ensureTimeWithSeconds(settings.business.operatingHours.start),
        endTime: ensureTimeWithSeconds(settings.business.operatingHours.end),
        maintenanceMode: settings.system.maintenanceMode,
        autoApproveUsers: settings.system.autoApproveUsers,
      };

      // Add location targeting
      if (location.dorm === 'all') {
        if (location.cityId) {
          // When a city is selected in the dropdown, send the cityId and keep dormIds empty.
          try {
            const dormsData = await overviewService.getDorms({ cityId: location.cityId });
            const dormIds = (dormsData || []).map((d: any) => d.id || d.dormId).filter(Boolean);
            payload.cityId = location.cityId;
            payload.dormIds = [];
            console.log('Loaded dorms for selected city:', dormIds);
          } catch (err) {
            console.error('Failed to load dorms for city while saving settings:', err);
            // Fallback to empty array if fetch fails
            payload.cityId = location.cityId;
            payload.dormIds = [];
          }
        } else {
          // No cityId available — send an empty dormIds array as backend expects
          payload.dormIds = [];
        }
      } else {
        // Resolve dormIds to UUIDs
        let resolvedDormIds: string[] = [];

        if (location.dormId) {
          // If dormId looks like a UUID, use it; otherwise try to resolve via allDorms
          const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
          if (uuidRegex.test(location.dormId)) {
            resolvedDormIds = [location.dormId];
          } else {
            const match = allDorms.find(d => (d.id === location.dormId) || (d.dormId === location.dormId) || (d.name === location.dormId) || (d.dormName === location.dormId));
            if (match) resolvedDormIds = [match.id || match.dormId].filter(Boolean) as string[];
          }
        } else if (location.dorm && location.dorm !== 'all') {
          // location.dorm might be the dorm name
          const match = allDorms.find(d => d.name === location.dorm || d.dormName === location.dorm);
          if (match) resolvedDormIds = [match.id || match.dormId].filter(Boolean) as string[];
        }

        // Ensure we always send an array (backend requires array)
        payload.dormIds = resolvedDormIds;
        console.log('Resolved dormIds for save:', payload.dormIds);
      }

      console.group('Saving settings payload');
      console.log(payload);
      console.log('Request body (JSON):', JSON.stringify(payload));
      console.log('Request endpoint:', ENDPOINTS.SETTINGS.UPDATE_ALL_DORMS);
      console.log('Request headers:', { 'content-type': 'application/json' });
      console.groupEnd();

      const result = await settingsService.updateAllDorms(payload);
      const successMsg = (result && (result.message || result.status === 'ok')) ? (result.message || 'Settings updated') : 'Settings saved successfully!';
      const affected = result?.affectedDorms?.length;

      toast.success(successMsg, {
        description: affected ? `Applied to ${affected} dorm(s)` : undefined,
      });

      // Refresh settings from server so UI reflects latest values
      try {
        const refreshed = await settingsService.getAllSettings(location.dormId ? undefined : location.cityId, location.dormId);
        if (refreshed) {
          setApiSettings(refreshed);
          const resolvedSettings = resolveSettingsScope(refreshed, location);
          if (resolvedSettings) {
            setSettings(prev => applyResolvedSettings(prev, resolvedSettings, location));
          }
        }
      } catch (err) {
        console.error('Failed to refresh settings after save:', err);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      const backendMsg = (error as any)?.responseBody?.message || (error as any)?.message;
      console.error('Backend response body:', (error as any)?.responseBody);
      toast.error(backendMsg || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    try {
      setIsResetting(true);
      const payload: any = {};

      if (location.dorm === 'all' && location.cityId) {
        payload.cityId = location.cityId;
      } else if (location.dormId) {
        payload.dormIds = [location.dormId];
      }

      const result = await settingsService.resetSettings(payload);
      
      toast.success('Settings reset successfully!', {
        description: result.message || 'Settings have been reset to defaults',
      });

      setShowResetConfirm(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error((error as any)?.message || 'Failed to reset settings');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!customMessage.trim()) return;

    try {
      const payload: any = {
        message: customMessage,
      };

      if (systemMessageGlobal) {
        // Send to all dorms across all cities for this client
        // No cityId or dormIds when global
      } else {
        // Send to specific location
        if (location.dorm === 'all' && location.cityId) {
          payload.cityId = location.cityId;
        } else if (location.dormId) {
          payload.dormIds = [location.dormId];
        }
      }

      await settingsService.addSystemMessage(payload);

      toast.success('Message sent to users!', {
        description: systemMessageGlobal
          ? 'System message broadcast to all locations'
          : `System message broadcast to users in ${location.city}`,
      });
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error((error as any)?.message || 'Failed to send message');
    }
  };

  const handleMaintenanceNoticeChange = (field: string, value: string | boolean | string[]) => {
    setSettings(prev => {
      const updatedNotice = {
        ...prev.system.maintenanceNotice,
        [field]: value
      };

      // If start date changes and is after end date, update end date to match start date
      if (field === 'startDate' && typeof value === 'string') {
        if (value > updatedNotice.endDate) {
          updatedNotice.endDate = value;
        }
      }

      return {
        ...prev,
        system: {
          ...prev.system,
          maintenanceNotice: updatedNotice
        }
      };
    });
  };

  const handleSendMaintenanceNotice = async () => {
    try {
      const notice = settings.system.maintenanceNotice;
      
      // Validate dates
      const today = new Date().toISOString().split('T')[0];
      
      if (notice.startDate < today) {
        toast.error('Start date cannot be in the past');
        return;
      }
      
      if (notice.endDate < notice.startDate) {
        toast.error('End date must be after start date');
        return;
      }
      
      // Validate times if same day
      if (notice.startDate === notice.endDate && notice.endTime <= notice.startTime) {
        toast.error('End time must be after start time for same-day maintenance');
        return;
      }

      // Check that at least one dorm or city is selected
      if (!notice.allDormsInCity && notice.dormIds.length === 0) {
        toast.error('Please select at least one dorm or apply to all dorms in city');
        return;
      }
      
      // Build payload using backend-expected fields
      const payload: any = {
        title: notice.title,
        message: notice.message,
        // Backend expects separate date and time fields
        startTime: notice.startTime, // HH:MM
        endTime: notice.endTime,     // HH:MM
        startDate: notice.startDate, // YYYY-MM-DD
        endDate: notice.endDate,     // YYYY-MM-DD
      };

      // Targeting: when applying to entire city, include `cityId` and send empty `dormIds`.
      // When specific dorms are selected, include only `dormIds` and omit `cityId`.
      if (notice.allDormsInCity && notice.cityId) {
        payload.cityId = notice.cityId;
        payload.dormIds = [];
      } else if (notice.dormIds && notice.dormIds.length > 0) {
        payload.dormIds = notice.dormIds;
      }

      console.group('Sending Maintenance Notice');
      console.log('Payload:', payload);
      console.groupEnd();

      await settingsService.addMaintenanceMessage(payload);

      toast.success('Maintenance notice sent!', {
        description: 'Users have been notified about the maintenance window.',
      });
    } catch (error) {
      console.error('Error sending maintenance notice:', error);
      const errorMsg = (error as any)?.responseBody?.message || (error as any)?.message || 'Failed to send maintenance notice';
      console.error('Backend error details:', (error as any)?.responseBody);
      toast.error(errorMsg);
    }
  };

  const maintenanceCity = settings.system.maintenanceNotice.cityId;
  // allDorms are already filtered by selected city when user changes city
  const availableDormsForMaintenance = allDorms;

  const handleMaintenanceCityChange = async (city: string) => {
    try {
      setIsLoadingCitiesDorms(true);
      // Fetch dorms for the selected city
      const dormsData = await overviewService.getDorms({ cityId: city });
      setAllDorms(dormsData);

      // Extract dorm IDs from fetched dorms
      const dormIds = dormsData.map(d => d.id || d.dormId || '').filter(Boolean);

      setSettings(prev => ({
        ...prev,
        system: {
          ...prev.system,
          maintenanceNotice: {
            ...prev.system.maintenanceNotice,
            cityId: city,
            dormIds: prev.system.maintenanceNotice.allDormsInCity
              ? []
              : prev.system.maintenanceNotice.dormIds.filter(dormId => dormIds.includes(dormId))
          }
        }
      }));
    } catch (error) {
      console.error('Error loading dorms for city:', error);
      toast.error('Failed to load dorms for selected city');
    } finally {
      setIsLoadingCitiesDorms(false);
    }
  };

  const handleDormToggle = (dorm: string, checked: boolean) => {
    const currentDorms = settings.system.maintenanceNotice.dormIds;
    const nextDorms = checked
      ? [...currentDorms, dorm]
      : currentDorms.filter(d => d !== dorm);

    handleMaintenanceNoticeChange('dormIds', nextDorms);
  };

  if (!location.cityId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p>Please select a city and dorm to configure settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Admin Settings</h2>
          <p className="text-muted-foreground">
            Configure system settings for {location.city}
            {location.dorm !== 'all' && ' - Selected Dormitory'}
          </p>
          {settingsError && (
            <p className="text-sm text-amber-600 mt-2">{settingsError}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowResetConfirm(true)}
            disabled={isSaving || isResetting}
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || isLoadingSettings}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
          <CardDescription>
            General system settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-reservation">Max Reservation Time (minutes)</Label>
              <Input
                id="max-reservation"
                type="number"
                value={settings.system.maxReservationTime}
                onChange={(e) => handleSettingChange('system', 'maxReservationTime', e.target.value)}
                disabled={isLoadingSettings}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning-interval">Cleaning Interval (minutes)</Label>
              <Select
                value={settings.system.cleaningInterval}
                onValueChange={(value) => handleSettingChange('system', 'cleaningInterval', value)}
                disabled={isLoadingSettings}
              >
                <SelectTrigger id="cleaning-interval">
                  <SelectValue placeholder="Select cleaning interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Disable user access for maintenance</p>
            </div>
            <Switch
              checked={settings.system.maintenanceMode}
              onCheckedChange={(value: boolean) => handleSettingChange('system', 'maintenanceMode', value)}
              disabled={isLoadingSettings}
            />
          </div>

          {settings.system.maintenanceMode && (
            <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
              <div>
                <h4 className="font-medium">Maintenance Notice</h4>
                <p className="text-sm text-muted-foreground">Configure maintenance title, message, schedule, and location targeting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="maintenance-title">Title</Label>
                  <Input
                    id="maintenance-title"
                    value={settings.system.maintenanceNotice.title}
                    onChange={(e) => handleMaintenanceNoticeChange('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="maintenance-message">Message</Label>
                  <Textarea
                    id="maintenance-message"
                    rows={3}
                    value={settings.system.maintenanceNotice.message}
                    onChange={(e) => handleMaintenanceNoticeChange('message', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-start-time">Start Time</Label>
                  <Input
                    id="maintenance-start-time"
                    type="time"
                    value={settings.system.maintenanceNotice.startTime}
                    onChange={(e) => handleMaintenanceNoticeChange('startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-end-time">End Time</Label>
                  <Input
                    id="maintenance-end-time"
                    type="time"
                    value={settings.system.maintenanceNotice.endTime}
                    onChange={(e) => handleMaintenanceNoticeChange('endTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-start-date">Start Date</Label>
                  <Input
                    id="maintenance-start-date"
                    type="date"
                    min={todayDate}
                    value={settings.system.maintenanceNotice.startDate}
                    onChange={(e) => handleMaintenanceNoticeChange('startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance-end-date">End Date</Label>
                  <Input
                    id="maintenance-end-date"
                    type="date"
                    min={settings.system.maintenanceNotice.startDate}
                    value={settings.system.maintenanceNotice.endDate}
                    onChange={(e) => handleMaintenanceNoticeChange('endDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Target City</Label>
                  <Select
                    value={maintenanceCity}
                    onValueChange={handleMaintenanceCityChange}
                    disabled={isLoadingCitiesDorms}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.id || city.cityId} value={city.id || city.cityId || city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">No cities available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="all-dorms-in-city"
                    checked={settings.system.maintenanceNotice.allDormsInCity}
                    onCheckedChange={(value) => {
                      const checked = value === true;
                      setSettings(prev => ({
                        ...prev,
                        system: {
                          ...prev.system,
                          maintenanceNotice: {
                            ...prev.system.maintenanceNotice,
                            allDormsInCity: checked,
                            dormIds: checked ? [] : prev.system.maintenanceNotice.dormIds
                          }
                        }
                      }));
                    }}
                  />
                  <Label htmlFor="all-dorms-in-city">Apply to all dorms in selected city</Label>
                </div>

                {!settings.system.maintenanceNotice.allDormsInCity && (
                  <div className="md:col-span-2 space-y-2">
                    <Label>Select Dorms</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-md border p-3 max-h-56 overflow-y-auto">
                      {availableDormsForMaintenance.length > 0 ? (
                        availableDormsForMaintenance.map((dorm) => {
                          const dormId = dorm.id || dorm.dormId || '';
                          const dormName = dorm.name || dorm.dormName || '';
                          return (
                            <div key={dormId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dorm-${dormId}`}
                                checked={settings.system.maintenanceNotice.dormIds.includes(dormId)}
                                onCheckedChange={(value) => handleDormToggle(dormId, value === true)}
                              />
                              <Label htmlFor={`dorm-${dormId}`} className="text-sm font-normal">{dormName}</Label>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No dorms found for this city.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <Button onClick={handleSendMaintenanceNotice} className="w-full">
                    Send Maintenance Notice
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve Users</Label>
              <p className="text-sm text-muted-foreground">Automatically approve new registrations</p>
            </div>
            <Switch
              checked={settings.system.autoApproveUsers}
              onCheckedChange={(value: boolean) => handleSettingChange('system', 'autoApproveUsers', value)}
              disabled={isLoadingSettings}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Business Configuration
          </CardTitle>
          <CardDescription>
            Configure pricing and operational settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reservation-price">Reservation Price (€)</Label>
              <Input
                id="reservation-price"
                type="number"
                step="0.01"
                value={settings.business.reservationPrice}
                onChange={(e) => handleSettingChange('business', 'reservationPrice', e.target.value)}
                disabled={isLoadingSettings}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellation-window">Cancellation Window (minutes)</Label>
              <Input
                id="cancellation-window"
                type="number"
                value={settings.business.cancellationWindow}
                onChange={(e) => handleSettingChange('business', 'cancellationWindow', e.target.value)}
                disabled={isLoadingSettings}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-future-reservation-days">Max Future Reservation Days</Label>
              <Select
                value={settings.business.maxFutureReservationDays}
                onValueChange={handleMaxFutureReservationChange}
                disabled={isLoadingSettings}
              >
                <SelectTrigger id="max-future-reservation-days">
                  <SelectValue placeholder="Select max days" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day} day{day !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-number-of-queues">Max Number of Queues</Label>
              <Select
                value={settings.business.maxNumberOfQueues}
                onValueChange={(value) => handleSettingChange('business', 'maxNumberOfQueues', value)}
                disabled={isLoadingSettings}
              >
                <SelectTrigger id="max-number-of-queues">
                  <SelectValue placeholder="Select max queues" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((queue) => (
                    <SelectItem key={queue} value={String(queue)}>
                      {queue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operating Hours</Label>
              <div className="flex space-x-2">
                <Input
                  type="time"
                  value={settings.business.operatingHours.start}
                  onChange={(e) => handleSettingChange('business', 'operatingHours', {
                    ...settings.business.operatingHours,
                    start: e.target.value
                  })}
                  disabled={isLoadingSettings}
                />
                <Input
                  type="time"
                  value={settings.business.operatingHours.end}
                  onChange={(e) => handleSettingChange('business', 'operatingHours', {
                    ...settings.business.operatingHours,
                    end: e.target.value
                  })}
                  disabled={isLoadingSettings}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            System Messages
          </CardTitle>
          <CardDescription>
            Send system-wide messages to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="global-message"
              checked={systemMessageGlobal}
              onCheckedChange={(value) => setSystemMessageGlobal(value === true)}
            />
            <Label htmlFor="global-message">Send to all locations</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-message">Message to Users</Label>
            <Textarea
              id="custom-message"
              placeholder="Enter a system message to broadcast to users..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!customMessage.trim()}>
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">234</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45</div>
              <div className="text-sm text-muted-foreground">Active Machines</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings</AlertDialogTitle>
            <AlertDialogDescription>
              {location.dorm === 'all'
                ? `This will reset all settings for dorms in ${location.city} to default values. This action cannot be undone.`
                : `This will reset all settings for the selected dorm to default values. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleResetConfirm} disabled={isResetting}>
            {isResetting ? 'Resetting...' : 'Reset Settings'}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      {/* Max Future Reservation Days Validation Alert */}
      <AlertDialog open={showMaxReservationAlert} onOpenChange={setShowMaxReservationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Value</AlertDialogTitle>
            <AlertDialogDescription>
              Future reservation can be done up to 7 days only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowMaxReservationAlert(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}