import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SectorGroup } from '@/hooks/useCedearSectors';

interface CEDEARSectorTabsProps {
  sectorGroups: SectorGroup[];
  activeSector: string;
  onSectorChange: (sector: string) => void;
  loading?: boolean;
}

const sectorIcons: Record<string, string> = {
  'Technology': '💻',
  'Healthcare': '🏥',
  'Financial Services': '🏦',
  'Consumer Discretionary': '🛍️',
  'Consumer Staples': '🛒',
  'Energy': '⚡',
  'Industrials': '🏭',
  'Materials': '⛏️',
  'Communication Services': '📡',
  'Utilities': '🔌',
  'Real Estate': '🏢'
};

export const CEDEARSectorTabs: React.FC<CEDEARSectorTabsProps> = ({
  sectorGroups,
  activeSector,
  onSectorChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex gap-2 min-w-fit p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-md animate-pulse min-w-[100px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={activeSector} onValueChange={onSectorChange} className="w-full">
        <TabsList className="inline-flex h-auto min-w-fit bg-muted p-1 rounded-lg">
          <TabsTrigger 
            value="all"
            className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap px-4 py-2"
          >
            <span>🌐</span>
            <span>Todos</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {sectorGroups.reduce((sum, g) => sum + g.count, 0)}
            </Badge>
          </TabsTrigger>
          
          <TabsTrigger 
            value="popular"
            className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap px-4 py-2"
          >
            <span>⭐</span>
            <span>Populares</span>
          </TabsTrigger>
          
          {sectorGroups.map((group) => (
            <TabsTrigger
              key={group.sector}
              value={group.sector}
              className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap px-4 py-2"
            >
              <span>{sectorIcons[group.sector] || '📊'}</span>
              <span className="hidden sm:inline">{group.sector}</span>
              <span className="sm:hidden">
                {group.sector.split(' ')[0]}
              </span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {group.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};