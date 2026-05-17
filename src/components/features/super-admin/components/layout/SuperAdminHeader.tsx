import Image from 'next/image';
import { LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuperAdminHeaderProps {
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SuperAdminHeader({ onLogout, onRefresh, isRefreshing }: SuperAdminHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/waschbuddy-logo-light.png"
            alt="WASCHBUDDY"
            width={190}
            height={60}
            loading="eager"
            className="h-12 w-auto"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-muted-foreground">Super Admin Console</p>
            <p className="text-xs text-muted-foreground">
              Global administration across clients, countries, cities, and dorms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
