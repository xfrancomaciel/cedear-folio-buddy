import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, BarChart3, FileText, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
  hash?: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: PieChart, label: 'Portfolio' },
  { path: '/cedear-prices', icon: BarChart3, label: 'CEDEARs' },
  { path: '/reports', icon: FileText, label: 'Reportes' },
  { path: '/settings', icon: Settings, label: 'Config' },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, touchTargetSize } = useMobileOptimizations();

  if (!isMobile) return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string, hash?: string) => {
    if (hash) {
      navigate(`${path}#${hash}`);
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item.path, item.hash)}
              className={cn(
                touchTargetSize,
                'flex flex-col items-center gap-1 text-xs px-2 py-2 rounded-lg transition-all duration-200',
                active 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card/95" />
    </nav>
  );
};