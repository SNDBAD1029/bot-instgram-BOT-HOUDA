import { Activity, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  botRunning: boolean;
  onlineStatus?: 'online' | 'offline' | 'loading';
}

export default function DashboardHeader({ botRunning, onlineStatus = 'offline' }: DashboardHeaderProps) {
  const statusConfig = {
    online: { label: 'أونلاين', color: 'bg-green-500', icon: Activity },
    offline: { label: 'متوقف', color: 'bg-gray-500', icon: AlertCircle },
    loading: { label: 'جارٍ التحميل...', color: 'bg-yellow-500', icon: Activity }
  };

  const status = botRunning ? statusConfig.online : statusConfig[onlineStatus];
  const StatusIcon = status.icon;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold text-foreground" data-testid="text-title">
            لوحة تحكم بوت إنستجرام
          </h1>
          
          <Badge 
            variant="secondary" 
            className="gap-2 px-3 py-1.5"
            data-testid="badge-status"
          >
            <StatusIcon className="w-4 h-4" />
            <span>{status.label}</span>
            <div className={`w-2 h-2 rounded-full ${status.color} ${botRunning ? 'animate-pulse' : ''}`} />
          </Badge>
        </div>
      </div>
    </header>
  );
}
