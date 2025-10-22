import { SOCIAL_MEDIA_LINKS } from '@/config/socialMedia';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

interface SocialMediaLinksProps {
  variant?: 'sidebar' | 'expanded';
  showLabels?: boolean;
  className?: string;
}

export const SocialMediaLinks = ({ 
  variant = 'sidebar', 
  showLabels = false,
  className 
}: SocialMediaLinksProps) => {
  const { open: sidebarOpen } = useSidebar();

  if (variant === 'sidebar') {
    return (
      <div className={cn("flex items-center gap-2 px-4 py-2 border-t border-sidebar-border", className)}>
        <TooltipProvider>
          {SOCIAL_MEDIA_LINKS.map((social) => {
            const Icon = social.icon;
            const content = (
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visitar ${social.name} de BDI Consultora`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && showLabels && (
                  <span className="text-sm">{social.name}</span>
                )}
              </a>
            );

            if (!sidebarOpen) {
              return (
                <Tooltip key={social.name}>
                  <TooltipTrigger asChild>
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{social.name}: {social.username}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={social.name}>{content}</div>;
          })}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {SOCIAL_MEDIA_LINKS.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visitar ${social.name} de BDI Consultora`}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
          >
            <Icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{social.name}</p>
              <p className="text-xs text-muted-foreground">{social.username}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
};
