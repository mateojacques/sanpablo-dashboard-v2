import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, Package, LayoutDashboard, FolderTree, Images, Palette, HelpCircle, FileText, Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Productos', href: '/products', icon: Package },
      { title: 'Categorías', href: '/categories', icon: FolderTree },
      { title: 'Carruseles', href: '/carousels', icon: Images },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { title: 'Apariencia', href: '/storefront', icon: Palette },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { title: 'Preguntas Frecuentes', href: '/content/faq', icon: HelpCircle },
      { title: 'Términos y Condiciones', href: '/content/terms', icon: FileText },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { title: 'Importar CSV', href: '/tools/import-csv', icon: Wrench },
      { title: 'Convertir DBF', href: '/tools/import-dbf', icon: Wrench },
      { title: 'Imágenes Masivas', href: '/tools/bulk-images', icon: Wrench },
    ],
  },
];

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Mobile menu button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-5 w-5" />
              </div>
              San Pablo
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <nav className="space-y-4 p-4">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive =
                        item.href === '/'
                          ? location.pathname === '/'
                          : location.pathname.startsWith(item.href);

                      return (
                        <li key={item.href}>
                          <NavLink
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-accent text-accent-foreground'
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Spacer for desktop */}
      <div className="hidden md:block" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
