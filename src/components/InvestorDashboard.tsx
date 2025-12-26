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
  ChevronRight,
  Youtube,
  MessageCircle,
  Target,
  LogOut,
  User,
  Wrench,
  PlayCircle,
  ExternalLink,
  PieChart,
  Crown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PLAN_NAMES } from "@/lib/planAuthorization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarRates } from "@/components/DollarRates";
import { AdminPanel } from "@/components/AdminPanel/AdminPanel";
import { SocialMediaLinks } from "@/components/SocialMediaLinks";
import { toast } from "sonner";

const navigationItems = [
  {
    title: "Optimizador",
    url: "/optimizador",
    icon: Target,
    tooltip: "Optimizador de cartera Markowitz",
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
    tooltip: "Reportes y análisis",
  },
  {
    title: "CEDEARs",
    url: "/acciones",
    icon: DollarSign,
    tooltip: "Precios CEDEAR",
  },
  {
    title: "Calculadora de Retiro",
    url: "/calculadora-retiro",
    icon: BarChart3,
    tooltip: "Calculadora de jubilación e inversión",
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
];

export function InvestorDashboard() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const { plan } = useUserPlan();
  const isPremium = plan === 'bdi_inicial' || plan === 'bdi_plus';
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
              tooltip="Curso completo para principiantes (Premium)"
              isActive={location.pathname === '/curso-inicial'}
            >
              <Link to="/curso-inicial">
                <PlayCircle />
                <span>Curso Inicial</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  Premium
                </Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Canal de YouTube oficial"
              isActive={location.pathname === '/youtube'}
            >
              <Link to="/youtube">
                <Youtube />
                <span>YouTube</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Cursos y formación"
            >
              <a href="https://bdi-consultora1.tiendup.com/c/membresiasbdi" target="_blank" rel="noopener noreferrer">
                <GraduationCap />
                <span>Formaciones</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-60 shrink-0" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <DollarRates />
        <SocialMediaLinks variant="sidebar" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              size="lg"
            >
              <Link to="/configuracion" className="flex items-center gap-2 overflow-hidden w-full" aria-label={`Configuración. Plan: ${PLAN_NAMES[plan || 'cliente']}`}>
                <Avatar className={`h-8 w-8 shrink-0 rounded-full ${isPremium ? 'ring-2 ring-amber-500/80' : ''}`}>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 gap-0 overflow-hidden">
                  <div className="flex items-center min-w-0 gap-1">
                    <span className="truncate text-sm font-semibold leading-tight">
                      {getUserDisplayName()}
                    </span>
                    {isPremium && (
                      <Crown
                        className="h-3.5 w-3.5 text-amber-500 shrink-0"
                        aria-label={plan === 'bdi_plus' ? 'BDI Plus' : 'BDI Inicial'}
                      />
                    )}
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground leading-tight" title={user?.email || ''}>
                    {user?.email}
                  </span>
                  {plan && (
                    <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 mt-1">
                      {PLAN_NAMES[plan]}
                    </Badge>
                  )}
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
