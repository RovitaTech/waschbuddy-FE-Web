'use client';

import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ClientsTab } from './components/clients/ClientsTab';
import { CitiesTab } from './components/cities/CitiesTab';
import { CountriesTab } from './components/countries/CountriesTab';
import { DormsTab } from './components/dorms/DormsTab';
import { SuperAdminHeader } from './components/layout/SuperAdminHeader';
import { SuperAdminMobileNav } from './components/layout/SuperAdminMobileNav';
import { SuperAdminSidebar } from './components/layout/SuperAdminSidebar';
import { OverviewTab } from './components/overview/OverviewTab';
import { UsersTab } from './components/users/UsersTab';
import { useSuperAdminDashboard } from './hooks/useSuperAdminDashboard';
import type { SuperAdminTab } from './types';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');
  const dashboard = useSuperAdminDashboard();
  const { isLoading, isRefreshing, refreshData } = dashboard;

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminHeader
        onLogout={onLogout}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      <SuperAdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="md:flex">
        <SuperAdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1">
          <div className="p-4 md:p-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as SuperAdminTab)}
              className="space-y-6"
            >
              <TabsContent value="overview">
                <OverviewTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="clients">
                <ClientsTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="users">
                <UsersTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="countries">
                <CountriesTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="cities">
                <CitiesTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="dorms">
                <DormsTab dashboard={dashboard} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
