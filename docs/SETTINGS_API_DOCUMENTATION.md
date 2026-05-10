# Admin Settings API Documentation

## Overview

This document outlines the API endpoints required to implement the Admin Settings functionality in the WASCHBUDDY admin panel. The settings screen manages multiple categories of system configuration including notifications, system settings, security, business rules, system messages, and status monitoring.

## Architecture Decision: Single vs Multiple APIs

### Recommended Approach: **Hybrid (Unified Settings + Specialized Endpoints)**

After analyzing the settings structure, I recommend using a **hybrid approach**:

1. **Unified Settings API** - Single endpoint for all settings categories with optional category filtering
2. **System Messages API** - Separate endpoint for broadcasting messages (different functionality)
3. **System Status API** - Separate endpoint for read-only statistics (can reuse analytics)

### Rationale

**Single Unified API Benefits:**
- ✅ Simpler frontend state management (single fetch/store)
- ✅ Atomic updates (all settings saved together)
- ✅ Consistent versioning and caching
- ✅ Easier to validate dependencies between settings
- ✅ Supports both bulk and category-specific updates

**Separate Endpoints Benefits:**
- ✅ System messages have different access patterns (send vs configure)
- ✅ System status is read-only and different from configuration
- ✅ Better separation of concerns

## API Endpoints

### 1. Get Settings

Retrieve all or specific category of settings for a location.

**Endpoint:** `GET /api/admin/settings`

**Query Parameters:**
- `city` (required): City name
- `dorm` (optional): Dormitory name, or `all` for all dormitories
- `category` (optional): Filter by category (`notifications`, `system`, `security`, `business`). If omitted, returns all categories.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "emailAlerts": true,
      "systemMaintenance": true,
      "userRegistrations": true,
      "machineAlerts": true,
      "reservationAlerts": false
    },
    "system": {
      "maintenanceMode": false,
      "autoApproveUsers": false,
      "maxReservationTime": 60,
      "cleaningInterval": 120,
      "language": "en",
      "timezone": "Europe/Berlin"
    },
    "security": {
      "sessionTimeout": 30,
      "passwordExpiry": 90,
      "twoFactorAuth": false,
      "ipRestriction": false,
      "auditLogging": true
    },
    "business": {
      "reservationPrice": 2.50,
      "cancellationWindow": 15,
      "maxDailyReservations": 3,
      "operatingHours": {
        "start": "06:00",
        "end": "23:00"
      }
    }
  },
  "meta": {
    "city": "Berlin",
    "dorm": "all",
    "updatedAt": "2024-01-15T10:30:00Z",
    "updatedBy": "admin@example.com"
  }
}
```

**Example Requests:**
```bash
# Get all settings
GET /api/admin/settings?city=Berlin&dorm=all

# Get only notifications settings
GET /api/admin/settings?city=Berlin&dorm=all&category=notifications
```

---

### 2. Update Settings

Update all or specific category of settings.

**Endpoint:** `PUT /api/admin/settings` (full update) or `PATCH /api/admin/settings` (partial update)

**Query Parameters:**
- `city` (required): City name
- `dorm` (optional): Dormitory name, or `all` for all dormitories

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (PUT - Full Update):**
```json
{
  "notifications": {
    "emailAlerts": true,
    "systemMaintenance": true,
    "userRegistrations": true,
    "machineAlerts": true,
    "reservationAlerts": false
  },
  "system": {
    "maintenanceMode": false,
    "autoApproveUsers": false,
    "maxReservationTime": 60,
    "cleaningInterval": 120,
    "language": "en",
    "timezone": "Europe/Berlin"
  },
  "security": {
    "sessionTimeout": 30,
    "passwordExpiry": 90,
    "twoFactorAuth": false,
    "ipRestriction": false,
    "auditLogging": true
  },
  "business": {
    "reservationPrice": 2.50,
    "cancellationWindow": 15,
    "maxDailyReservations": 3,
    "operatingHours": {
      "start": "06:00",
      "end": "23:00"
    }
  }
}
```

**Request Body (PATCH - Partial Update by Category):**
```json
{
  "category": "notifications",
  "settings": {
    "emailAlerts": false,
    "machineAlerts": true
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    // Same structure as GET response
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid settings data",
    "details": [
      {
        "field": "system.maxReservationTime",
        "message": "Must be between 15 and 180 minutes"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin access required"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this location"
  }
}
```

---

### 3. Reset Settings to Defaults

Reset settings to default values for a location.

**Endpoint:** `POST /api/admin/settings/reset`

**Query Parameters:**
- `city` (required): City name
- `dorm` (optional): Dormitory name, or `all` for all dormitories
- `category` (optional): Category to reset. If omitted, resets all categories.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response 200:**
```json
{
  "success": true,
  "message": "Settings reset to default values",
  "data": {
    // Default settings structure
  }
}
```

---

### 4. Send System Message

Broadcast a system-wide message to users in a location.

**Endpoint:** `POST /api/admin/system-messages`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "System maintenance scheduled for tomorrow at 2 AM",
  "city": "Berlin",
  "dorm": "all",
  "priority": "normal",
  "expiresAt": "2024-01-16T02:00:00Z"
}
```

**Request Fields:**
- `message` (required, string): Message content (max 1000 characters)
- `city` (required, string): Target city
- `dorm` (optional, string): Target dormitory, or `all` for all
- `priority` (optional, enum): `low`, `normal`, `high`, `urgent` (default: `normal`)
- `expiresAt` (optional, ISO 8601): When message expires (default: 7 days from now)

**Response 200:**
```json
{
  "success": true,
  "message": "System message sent successfully",
  "data": {
    "id": "msg_123456",
    "message": "System maintenance scheduled for tomorrow at 2 AM",
    "sentAt": "2024-01-15T10:30:00Z",
    "recipientCount": 234,
    "city": "Berlin",
    "dorm": "all"
  }
}
```

---

### 5. Get System Status

Retrieve current system health and statistics.

**Endpoint:** `GET /api/admin/system-status`

**Query Parameters:**
- `city` (optional): Filter by city
- `dorm` (optional): Filter by dormitory

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "uptime": 99.8,
    "averageResponseTime": 1.2,
    "activeUsers": 234,
    "activeMachines": 45,
    "systemHealth": "healthy",
    "lastChecked": "2024-01-15T10:30:00Z",
    "details": {
      "database": {
        "status": "healthy",
        "responseTime": 0.5
      },
      "cache": {
        "status": "healthy",
        "hitRate": 92.3
      },
      "services": {
        "status": "healthy"
      }
    }
  }
}
```

**Note:** This endpoint can reuse the existing `/api/analytics/dashboard` endpoint if it provides similar data.

---

## TypeScript Types

Add these types to `src/lib/api/types.ts`:

```typescript
// Settings Types
export interface NotificationSettings {
  emailAlerts: boolean;
  systemMaintenance: boolean;
  userRegistrations: boolean;
  machineAlerts: boolean;
  reservationAlerts: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  autoApproveUsers: boolean;
  maxReservationTime: number;
  cleaningInterval: number;
  language: string;
  timezone: string;
}

export interface SecuritySettings {
  sessionTimeout: number;
  passwordExpiry: number;
  twoFactorAuth: boolean;
  ipRestriction: boolean;
  auditLogging: boolean;
}

export interface OperatingHours {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface BusinessSettings {
  reservationPrice: number;
  cancellationWindow: number;
  maxDailyReservations: number;
  operatingHours: OperatingHours;
}

export interface AdminSettings {
  notifications: NotificationSettings;
  system: SystemSettings;
  security: SecuritySettings;
  business: BusinessSettings;
}

export interface SettingsResponse {
  success: boolean;
  data: AdminSettings;
  meta: {
    city: string;
    dorm: string | 'all';
    updatedAt: string;
    updatedBy: string;
  };
}

export interface UpdateSettingsRequest {
  notifications?: Partial<NotificationSettings>;
  system?: Partial<SystemSettings>;
  security?: Partial<SecuritySettings>;
  business?: Partial<BusinessSettings>;
}

export interface SystemMessageRequest {
  message: string;
  city: string;
  dorm?: string | 'all';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
}

export interface SystemMessageResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    message: string;
    sentAt: string;
    recipientCount: number;
    city: string;
    dorm: string | 'all';
  };
}

export interface SystemStatus {
  uptime: number;
  averageResponseTime: number;
  activeUsers: number;
  activeMachines: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  details?: {
    database?: {
      status: string;
      responseTime: number;
    };
    cache?: {
      status: string;
      hitRate: number;
    };
    services?: {
      status: string;
    };
  };
}

export interface SystemStatusResponse {
  success: boolean;
  data: SystemStatus;
}
```

---

## Endpoint Constants

Add to `src/lib/api/endpoints.ts`:

```typescript
export const ENDPOINTS = {
  // ... existing endpoints
  ADMIN: {
    SETTINGS: '/api/admin/settings',
    SETTINGS_RESET: '/api/admin/settings/reset',
    SYSTEM_MESSAGE: '/api/admin/system-messages',
    SYSTEM_STATUS: '/api/admin/system-status'
  }
} as const;
```

---

## Implementation Service

Create `src/lib/api/settings.ts`:

```typescript
import { apiRequest } from './index';
import { ENDPOINTS } from './endpoints';
import {
  AdminSettings,
  SettingsResponse,
  UpdateSettingsRequest,
  SystemMessageRequest,
  SystemMessageResponse,
  SystemStatusResponse
} from './types';

interface SettingsFilters {
  city: string;
  dorm?: string | 'all';
  category?: 'notifications' | 'system' | 'security' | 'business';
}

export const settingsService = {
  /**
   * Get settings for a location
   */
  getSettings: async (filters: SettingsFilters): Promise<SettingsResponse> => {
    const params = new URLSearchParams();
    params.append('city', filters.city);
    if (filters.dorm) params.append('dorm', filters.dorm);
    if (filters.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ADMIN.SETTINGS}?${queryString}`;
    
    return apiRequest<SettingsResponse>(endpoint);
  },

  /**
   * Update settings (full update)
   */
  updateSettings: async (
    filters: Pick<SettingsFilters, 'city' | 'dorm'>,
    settings: AdminSettings
  ): Promise<SettingsResponse> => {
    const params = new URLSearchParams();
    params.append('city', filters.city);
    if (filters.dorm) params.append('dorm', filters.dorm);
    
    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ADMIN.SETTINGS}?${queryString}`;
    
    return apiRequest<SettingsResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  /**
   * Partial update of settings by category
   */
  updateSettingsCategory: async (
    filters: Pick<SettingsFilters, 'city' | 'dorm'>,
    category: 'notifications' | 'system' | 'security' | 'business',
    settings: Partial<AdminSettings[keyof AdminSettings]>
  ): Promise<SettingsResponse> => {
    const params = new URLSearchParams();
    params.append('city', filters.city);
    if (filters.dorm) params.append('dorm', filters.dorm);
    
    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ADMIN.SETTINGS}?${queryString}`;
    
    return apiRequest<SettingsResponse>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ category, settings })
    });
  },

  /**
   * Reset settings to defaults
   */
  resetSettings: async (
    filters: SettingsFilters
  ): Promise<SettingsResponse> => {
    const params = new URLSearchParams();
    params.append('city', filters.city);
    if (filters.dorm) params.append('dorm', filters.dorm);
    if (filters.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    const endpoint = `${ENDPOINTS.ADMIN.SETTINGS_RESET}?${queryString}`;
    
    return apiRequest<SettingsResponse>(endpoint, {
      method: 'POST'
    });
  },

  /**
   * Send system message to users
   */
  sendSystemMessage: async (
    message: SystemMessageRequest
  ): Promise<SystemMessageResponse> => {
    return apiRequest<SystemMessageResponse>(ENDPOINTS.ADMIN.SYSTEM_MESSAGE, {
      method: 'POST',
      body: JSON.stringify(message)
    });
  },

  /**
   * Get system status
   */
  getSystemStatus: async (
    filters?: Pick<SettingsFilters, 'city' | 'dorm'>
  ): Promise<SystemStatusResponse> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.ADMIN.SYSTEM_STATUS}?${queryString}`
      : ENDPOINTS.ADMIN.SYSTEM_STATUS;
    
    return apiRequest<SystemStatusResponse>(endpoint);
  }
};
```

---

## Backend Implementation Guidelines

### Database Schema Recommendations

**Settings Table:**
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  dorm VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- 'notifications', 'system', 'security', 'business'
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(255),
  UNIQUE(city, dorm, category)
);
```

**System Messages Table:**
```sql
CREATE TABLE system_messages (
  id UUID PRIMARY KEY,
  message TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  dorm VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  expires_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by VARCHAR(255),
  recipient_count INTEGER
);
```

### Validation Rules

**Notification Settings:**
- All fields are booleans (no validation needed)

**System Settings:**
- `maxReservationTime`: 15-180 minutes
- `cleaningInterval`: 30-240 minutes
- `language`: Must be supported language code (`en`, `de`, `fr`, `es`)
- `timezone`: Valid IANA timezone identifier
- `maintenanceMode`: Boolean
- `autoApproveUsers`: Boolean

**Security Settings:**
- `sessionTimeout`: 5-480 minutes
- `passwordExpiry`: 30-365 days
- All boolean flags are valid

**Business Settings:**
- `reservationPrice`: >= 0, max 100.00
- `cancellationWindow`: 5-60 minutes
- `maxDailyReservations`: 1-10
- `operatingHours.start`: Valid time format (HH:mm)
- `operatingHours.end`: Valid time format (HH:mm)
- `operatingHours.end` must be after `operatingHours.start`

### Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Verify admin has access to the specified city/dorm
3. **Audit Logging**: Log all settings changes if `auditLogging` is enabled
4. **Rate Limiting**: Apply rate limits, especially to system message endpoint
5. **Input Validation**: Validate all input data server-side
6. **CSRF Protection**: Include CSRF tokens in requests

### Error Handling

Standardize error responses:
- `400`: Validation errors
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Settings not found for location
- `500`: Internal server error

---

## Frontend Integration Example

Update `AdminSettings.tsx` to use the API:

```typescript
import { settingsService } from '@/lib/api/settings';
import { useEffect } from 'react';

// Inside component:
useEffect(() => {
  const loadSettings = async () => {
    try {
      const response = await settingsService.getSettings({
        city: location.city,
        dorm: location.dorm || 'all'
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };
  loadSettings();
}, [location]);

const handleSave = async () => {
  try {
    await settingsService.updateSettings(
      { city: location.city, dorm: location.dorm || 'all' },
      settings
    );
    toast.success('Settings saved successfully!');
  } catch (error) {
    toast.error('Failed to save settings');
  }
};

const handleSendMessage = async () => {
  try {
    const response = await settingsService.sendSystemMessage({
      message: customMessage,
      city: location.city,
      dorm: location.dorm || 'all'
    });
    toast.success(`Message sent to ${response.data.recipientCount} users!`);
    setCustomMessage('');
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

---

## Summary

### API Endpoints Required

1. ✅ `GET /api/admin/settings` - Fetch settings
2. ✅ `PUT /api/admin/settings` - Full update
3. ✅ `PATCH /api/admin/settings` - Partial update by category
4. ✅ `POST /api/admin/settings/reset` - Reset to defaults
5. ✅ `POST /api/admin/system-messages` - Send broadcast message
6. ✅ `GET /api/admin/system-status` - Get system health (or reuse analytics)

### Recommendation: **5-6 Endpoints**

- **Primary Settings API**: Single unified endpoint with GET/PUT/PATCH methods
- **Reset Endpoint**: Separate for safety (explicit reset action)
- **System Messages**: Separate endpoint (different domain)
- **System Status**: Can reuse existing analytics or separate endpoint

This approach provides:
- ✅ Flexibility (bulk or category-specific updates)
- ✅ Safety (separate reset endpoint)
- ✅ Clear separation of concerns
- ✅ Scalability for future settings categories
- ✅ Simple frontend integration

---

## Next Steps

1. **Backend**: Implement the 5-6 endpoints as described
2. **Frontend**: 
   - Add TypeScript types to `src/lib/api/types.ts`
   - Add endpoints to `src/lib/api/endpoints.ts`
   - Create `src/lib/api/settings.ts` service
   - Update `AdminSettings.tsx` to use the API
   - Update `src/lib/api/index.ts` to export settings service
3. **Testing**: Write integration tests for each endpoint
4. **Documentation**: Add to main API documentation



