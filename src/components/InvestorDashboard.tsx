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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Plus,
  History,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    tooltip: "Panel principal",
  },
  {
    title: "Bonos",
    url: "/bonos",
    icon: TrendingUp,
    tooltip: "Análisis de bonos",
  },
  {
    title: "Acciones",
    url: "/acciones",
    icon: DollarSign,
    tooltip: "Precios CEDEAR",
  },
];

const portfolioItems = [
  {
    title: "Ver Portfolio",
    url: "/portfolio",
    tooltip: "Vista completa del portfolio",
  },
  {
    title: "Agregar",
    url: "/portfolio#add",
    tooltip: "Agregar transacciones",
  },
  {
    title: "Ganancias",
    url: "/portfolio#gains",
    tooltip: "Ganancias realizadas",
  },
  {
    title: "Historial",
    url: "/portfolio#history",
    tooltip: "Historial de transacciones",
  },
  {
    title: "Configuración",
    url: "/portfolio#settings",
    tooltip: "Configuración del portfolio",
  },
];

export function InvestorDashboard() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(
    location.pathname === '/portfolio' || location.pathname.startsWith('/portfolio')
  );
  
  const handleSignOut = async () => {
    await signOut();
  };

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
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <div className="h-4 w-4 bg-primary-foreground rounded-br-sm rounded-tr-xs rounded-tl-sm rounded-bl-xs" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">InvestorSuite</span>
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
                </SidebarMenuItem>
              ))}
              
              {/* Portfolio Collapsible Section */}
              <Collapsible open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip="Gestión de portfolio"
                      isActive={location.pathname.startsWith('/portfolio')}
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
                            isActive={location.pathname === item.url || (item.url.includes('#') && location.pathname === '/portfolio')}
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
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
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
                  <MoreHorizontal className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/configuracion" className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>Ver perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
