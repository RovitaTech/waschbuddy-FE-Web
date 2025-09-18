import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Bell, 
  Shield, 
  Globe, 
  Clock, 
  Mail, 
  Database, 
  Users, 
  Settings2,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettingsProps {
  location: { city: string; dorm: string | 'all' };
}

export function AdminSettings({ location }: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      systemMaintenance: true,
      userRegistrations: true,
      machineAlerts: true,
      reservationAlerts: false
    },
    system: {
      maintenanceMode: false,
      autoApproveUsers: false,
      maxReservationTime: '60',
      cleaningInterval: '120',
      language: 'en',
      timezone: 'Europe/Berlin'
    },
    security: {
      sessionTimeout: '30',
      passwordExpiry: '90',
      twoFactorAuth: false,
      ipRestriction: false,
      auditLogging: true
    },
    business: {
      reservationPrice: '2.50',
      cancellationWindow: '15',
      maxDailyReservations: '3',
      operatingHours: {
        start: '06:00',
        end: '23:00'
      }
    }
  });

  const [customMessage, setCustomMessage] = useState('');

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    // In real app, this would save to backend
    toast.success('Settings saved successfully!', {
      description: 'All changes have been applied to the system.',
    });
  };

  const handleReset = () => {
    toast.info('Settings reset to default values');
    // Reset logic would go here
  };

  const handleSendMessage = () => {
    if (!customMessage.trim()) return;
    
    toast.success('Message sent to all users!', {
      description: `System message broadcast to users in ${location.city}`,
    });
    setCustomMessage('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Admin Settings</h2>
          <p className="text-muted-foreground">
            Configure system settings for {location.city}
            {location.dorm !== 'all' && ' - Selected Dormitory'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-alerts">Email Alerts</Label>
              <Switch
                id="email-alerts"
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(value: boolean) => handleSettingChange('notifications', 'emailAlerts', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-maintenance">System Maintenance</Label>
              <Switch
                id="system-maintenance"
                checked={settings.notifications.systemMaintenance}
                onCheckedChange={(value: boolean) => handleSettingChange('notifications', 'systemMaintenance', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="user-registrations">User Registrations</Label>
              <Switch
                id="user-registrations"
                checked={settings.notifications.userRegistrations}
                onCheckedChange={(value: boolean) => handleSettingChange('notifications', 'userRegistrations', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="machine-alerts">Machine Alerts</Label>
              <Switch
                id="machine-alerts"
                checked={settings.notifications.machineAlerts}
                onCheckedChange={(value: boolean) => handleSettingChange('notifications', 'machineAlerts', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning-interval">Cleaning Interval (minutes)</Label>
              <Input
                id="cleaning-interval"
                type="number"
                value={settings.system.cleaningInterval}
                onChange={(e) => handleSettingChange('system', 'cleaningInterval', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">System Language</Label>
              <Select
                value={settings.system.language}
                onValueChange={(value) => handleSettingChange('system', 'language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.system.timezone}
                onValueChange={(value) => handleSettingChange('system', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                  <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
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
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve Users</Label>
              <p className="text-sm text-muted-foreground">Automatically approve new registrations</p>
            </div>
            <Switch
              checked={settings.system.autoApproveUsers}
              onCheckedChange={(value: boolean) => handleSettingChange('system', 'autoApproveUsers', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiry (days)</Label>
              <Input
                id="password-expiry"
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(value: boolean) => handleSettingChange('security', 'twoFactorAuth', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Restriction</Label>
                <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
              </div>
              <Switch
                checked={settings.security.ipRestriction}
                onCheckedChange={(value: boolean) => handleSettingChange('security', 'ipRestriction', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Log all admin actions</p>
              </div>
              <Switch
                checked={settings.security.auditLogging}
                onCheckedChange={(value: boolean) => handleSettingChange('security', 'auditLogging', value)}
              />
            </div>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellation-window">Cancellation Window (minutes)</Label>
              <Input
                id="cancellation-window"
                type="number"
                value={settings.business.cancellationWindow}
                onChange={(e) => handleSettingChange('business', 'cancellationWindow', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-daily">Max Daily Reservations</Label>
              <Input
                id="max-daily"
                type="number"
                value={settings.business.maxDailyReservations}
                onChange={(e) => handleSettingChange('business', 'maxDailyReservations', e.target.value)}
              />
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
                />
                <Input
                  type="time"
                  value={settings.business.operatingHours.end}
                  onChange={(e) => handleSettingChange('business', 'operatingHours', {
                    ...settings.business.operatingHours,
                    end: e.target.value
                  })}
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
          <div className="space-y-2">
            <Label htmlFor="custom-message">Message to Users</Label>
            <Textarea
              id="custom-message"
              placeholder="Enter a system message to broadcast to all users..."
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
    </div>
  );
}