import React from "react";
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
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Settings, 
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    tooltip: "Panel principal",
  },
  {
    title: "Portfolio CEDEAR",
    url: "/",
    icon: TrendingUp,
    tooltip: "Gestión de portfolio",
  },
  {
    title: "Precios CEDEAR",
    url: "/precios",
    icon: DollarSign,
    tooltip: "Precios en tiempo real",
  },
  {
    title: "Análisis",
    url: "/analisis",
    icon: BarChart3,
    tooltip: "Análisis de mercado",
  },
  {
    title: "Mercado",
    url: "/mercado",
    icon: PieChart,
    tooltip: "Estado del mercado",
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    tooltip: "Configuración de la app",
  },
];

export function InvestorDashboard() {
  const location = useLocation();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip="Cerrar sesión"
              className="text-destructive hover:text-destructive"
            >
              <Link to="/logout">
                <LogOut />
                <span>Cerrar Sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
