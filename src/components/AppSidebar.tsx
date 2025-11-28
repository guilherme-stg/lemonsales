import { Home, Plus, Trophy, Target, Users, UserPlus, FileText, Settings, Award, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  admin?: boolean;
}

const baseItems: MenuItem[] = [
  { title: 'Rankings', url: '/rankings', icon: Trophy },
  { title: 'Registrar Venda', url: '/registrar-venda', icon: Plus },
  { title: 'Minhas Conquistas', url: '/conquistas', icon: Award },
  { title: 'Acompanhar Metas', url: '/metas', icon: Target },
];

const adminItems: MenuItem[] = [
  { title: 'Registrar Usuário', url: '/registrar-usuario', icon: UserPlus, admin: true },
  { title: 'Solicitações', url: '/solicitacoes', icon: FileText, admin: true },
  { title: 'Gerenciar Metas', url: '/gerenciar-metas', icon: Settings, admin: true },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const { state } = useSidebar();
  const isAdmin = profile?.papel === 'MASTER' || profile?.papel === 'GESTOR';

  const allItems = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {state === 'collapsed' ? 'Menu' : 'Menu Principal'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
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
                      {item.admin && state !== 'collapsed' && (
                        <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
                          ADM
                        </Badge>
                      )}
                    </NavLink>
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
            <SidebarMenuButton asChild>
              <NavLink
                to="/perfil"
                className="hover:bg-muted/50 gaming-border-secondary"
                activeClassName="bg-gradient-primary text-primary-foreground font-bold"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {profile?.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-0">
                  <span className="text-sm font-medium">{profile?.nome}</span>
                  {profile?.apelido && state !== 'collapsed' && (
                    <span className="text-xs text-muted-foreground/60">"{profile.apelido}"</span>
                  )}
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
