import { Home, Plus, Trophy, Target, Users, UserPlus, FileText, Settings, Award, User, Key, ShoppingCart, Swords } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoImage from '@/assets/META_SALES.png';
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
  masterOnly?: boolean;
}

const baseItems: MenuItem[] = [
  { title: 'Rankings', url: '/rankings', icon: Trophy },
  { title: 'Corrida Medieval', url: '/medieval-race', icon: Swords },
  { title: 'Registrar Venda', url: '/registrar-venda', icon: Plus },
  { title: 'Minhas Conquistas', url: '/conquistas', icon: Award },
  { title: 'Acompanhar Metas', url: '/metas', icon: Target },
];

const adminItems: MenuItem[] = [
  { title: 'Registrar Usuário', url: '/registrar-usuario', icon: UserPlus, admin: true },
  { title: 'Alterar Senha', url: '/alterar-senha', icon: Key, admin: true, masterOnly: true },
  { title: 'Solicitações', url: '/solicitacoes', icon: FileText, admin: true },
  { title: 'Gerenciar Metas', url: '/gerenciar-metas', icon: Settings, admin: true },
  { title: 'Gerenciar Vendas', url: '/gerenciar-vendas', icon: ShoppingCart, admin: true },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const { state } = useSidebar();
  const isAdmin = profile?.papel === 'MASTER' || profile?.papel === 'GESTOR';
  const isMaster = profile?.papel === 'MASTER';

  const allItems = isAdmin 
    ? [...baseItems, ...adminItems.filter(item => !item.masterOnly || isMaster)]
    : baseItems;

  return (
    <Sidebar collapsible="icon">
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        <img src={logoImage} alt="META SALES" className="h-12 w-auto object-contain" />
      </div>
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
      
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="h-auto py-3">
              <NavLink
                to="/perfil"
                className="hover:bg-muted/50 gaming-border-secondary flex items-center gap-3"
                activeClassName="bg-gradient-primary text-primary-foreground font-bold"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-base">
                    {profile?.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">{profile?.nome}</span>
                  {profile?.apelido && state !== 'collapsed' && (
                    <span className="text-xs text-muted-foreground/70 truncate w-full">{profile.apelido}</span>
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
