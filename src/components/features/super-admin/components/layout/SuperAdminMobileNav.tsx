import { BarChart3, Building2, Globe2, MapPin, Users } from 'lucide-react';
import type { SuperAdminTab } from '../../types';

interface SuperAdminMobileNavProps {
  activeTab: SuperAdminTab;
  onTabChange: (tab: SuperAdminTab) => void;
}

const NAV_ITEMS: { value: SuperAdminTab; label: string; icon: typeof BarChart3 }[] = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'clients', label: 'Clients', icon: Building2 },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'countries', label: 'Countries', icon: Globe2 },
  { value: 'cities', label: 'Cities', icon: MapPin },
  { value: 'dorms', label: 'Dorms', icon: Building2 },
];

export function SuperAdminMobileNav({ activeTab, onTabChange }: SuperAdminMobileNavProps) {
  return (
    <div className="border-b bg-card px-3 py-3 md:hidden">
      <div className="grid grid-cols-3 gap-2 text-xs font-medium">
        {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 transition-colors ${
              activeTab === value
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'bg-background hover:bg-accent/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
