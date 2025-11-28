import { Users, UserCheck, Trophy, Target, Gift, Settings, Home } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Solicitações', url: '/solicitacoes', icon: UserCheck },
  { title: 'Usuários', url: '/usuarios', icon: Users },
  { title: 'Rankings', url: '/rankings', icon: Trophy },
  { title: 'Missões', url: '/missoes', icon: Target },
  { title: 'Recompensas', url: '/recompensas', icon: Gift },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function MasterSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Painel Master
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50 gaming-border-secondary"
                      activeClassName="bg-gradient-primary text-primary-foreground font-bold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
