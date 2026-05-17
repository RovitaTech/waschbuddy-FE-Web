import { BarChart3, Building2, Globe2, MapPin, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SuperAdminTab } from '../../types';

interface SuperAdminSidebarProps {
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

export function SuperAdminSidebar({ activeTab, onTabChange }: SuperAdminSidebarProps) {
  return (
    <aside className="hidden w-72 border-r bg-card md:block">
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as SuperAdminTab)} orientation="vertical">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0">
            {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="justify-start">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </aside>
  );
}
