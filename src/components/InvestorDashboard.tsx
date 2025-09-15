import React, { useState } from "react";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  GraduationCap,
  FileText,
  Eye,
  Plus,
  History,
  Settings,
  ChartLine,
  Map, 
  Search,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  Youtube,
  MessageCircle,
  Target,
  LogOut,
  User,
  Wrench,
  PlayCircle,
  ExternalLink,
  PieChart
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarRates } from "@/components/DollarRates";
import { AdminPanel } from "@/components/AdminPanel/AdminPanel";
import { toast } from "sonner";

const navigationItems = [
  {
    title: "CEDEARs",
    url: "/acciones",
    icon: DollarSign,
    tooltip: "Precios CEDEAR",
  },
  {
    title: "Curso inicial completo",
    url: "/curso-inicial",
    icon: PlayCircle,
    tooltip: "Curso completo para principiantes",
  },
  {
    title: "Formaciones",
    url: "/formaciones",
    icon: GraduationCap,
    tooltip: "Cursos y formación",
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
    tooltip: "Reportes y análisis",
  },
];

const portfolioItems = [
  {
    title: "Ver Portfolio",
    url: "/portfolio",
    icon: Eye,
    tooltip: "Vista general del portfolio",
  },
  {
    title: "Agregar",
    url: "/portfolio",
    icon: Plus,
    tooltip: "Agregar transacción",
  },
  {
    title: "Ganancias",
    url: "/portfolio",
    icon: TrendingUp,
    tooltip: "Ganancias realizadas",
  },
  {
    title: "Historial",
    url: "/portfolio",
    icon: History,
    tooltip: "Historial de transacciones",
  },
  {
    title: "Optimizador",
    url: "/portfolio/optimizador",
    icon: Target,
    tooltip: "Optimización de cartera",
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    tooltip: "Configuración del portfolio",
  },
];

const herramientasItems = [
  {
    title: "Graficador",
    url: "/herramientas/graficador",
    tooltip: "Gráficos avanzados TradingView",
  },
  {
    title: "Mapa",
    url: "/herramientas/mapa",
    tooltip: "Mapa de calor de acciones",
  },
  {
    title: "Screener",
    url: "/herramientas/screener",
    tooltip: "Screener de acciones",
  },
  {
    title: "Analizador",
    url: "/herramientas/analizador",
    tooltip: "Análisis completo de acciones",
  },
];

export function InvestorDashboard() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(
    location.pathname === '/portfolio' || location.pathname.startsWith('/portfolio')
  );
  const [isHerramientasOpen, setIsHerramientasOpen] = useState(
    location.pathname.startsWith('/herramientas')
  );
  const [isAdminOpen, setIsAdminOpen] = useState(
    location.pathname.startsWith('/admin')
  );
  
  
  const getUserDisplayName = () => {
    if (profile?.username) return `@${profile.username}`;
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (profile?.username) return profile.username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} - Próximamente disponible`, {
      description: "Esta funcionalidad estará disponible en futuras actualizaciones."
    });
  };
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/portfolio">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BDI Suite</span>
                  <span className="truncate text-xs">Suite de inversiones</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {'comingSoon' in item && item.comingSoon ? (
                    <SidebarMenuButton 
                      tooltip={item.tooltip}
                      onClick={() => handleComingSoon(item.title)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.tooltip}
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
              
              {/* Portfolio Collapsible Section */}
              <Collapsible open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip="Gestión de portfolio"
                      isActive={location.pathname === '/portfolio' && !location.hash}
                    >
                      <PieChart />
                      <span>Portfolio</span>
                      <ChevronRight className={`ml-auto transition-transform duration-200 ${isPortfolioOpen ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {portfolioItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={item.url.includes('#') ? 
                              location.pathname + location.hash === item.url : 
                              location.pathname === item.url}
                          >
                            <Link to={item.url}>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Herramientas Collapsible Section */}
              <Collapsible open={isHerramientasOpen} onOpenChange={setIsHerramientasOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip="Herramientas de trading"
                      isActive={location.pathname.startsWith('/herramientas')}
                    >
                      <Wrench />
                      <span>Herramientas</span>
                      <ChevronRight className={`ml-auto transition-transform duration-200 ${isHerramientasOpen ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {herramientasItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={location.pathname === item.url}
                          >
                            <Link to={item.url}>
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {/* Admin Panel - Only for admin users */}
          {isAdmin && (
            <AdminPanel 
              isOpen={isAdminOpen} 
              onToggle={setIsAdminOpen} 
            />
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Canal de YouTube oficial"
              isActive={location.pathname === '/youtube'}
            >
              <Link to="/youtube">
                <PlayCircle />
                <span>YouTube</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Comunidad de inversores"
            >
              <a href="https://chat.bdiconsultora.com/signup_user_complete/?id=7z8bfgqz9j8nbbf7z78n6q6opw&md=link&sbr=fa" target="_blank" rel="noopener noreferrer">
                <Users />
                <span>Comunidad</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <DollarRates />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              size="lg"
            >
              <Link to="/configuracion" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {getUserDisplayName()}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
