import React, { useState } from 'react';
import { 
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ShieldCheck, 
  Users, 
  ChevronRight,
  Settings,
  FileText
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const adminItems = [
  {
    title: "Gestión de Usuarios",
    url: "/admin/users",
    icon: Users,
    tooltip: "Administrar usuarios del sistema"
  },
  {
    title: "Gestión de Reportes",
    url: "/admin/reports",
    icon: FileText,
    tooltip: "Administrar reportes y publicaciones"
  }
];

interface AdminPanelProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function AdminPanel({ isOpen, onToggle }: AdminPanelProps) {
  const location = useLocation();

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip="Panel de administración"
            isActive={location.pathname.startsWith('/admin')}
          >
            <ShieldCheck />
            <span>Panel de Administración</span>
            <ChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {adminItems.map((item) => (
              <SidebarMenuSubItem key={item.title}>
                <SidebarMenuSubButton 
                  asChild
                  isActive={location.pathname === item.url}
                >
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}