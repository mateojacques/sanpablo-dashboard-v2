import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Images,
  Palette,
  HelpCircle,
  FileText,
  Wrench,
  FileSpreadsheet,
  Database,
  ImagePlus,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
      { title: 'Ordenes', href: '/orders', icon: ShoppingCart },
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
      { title: 'Herramientas', href: '/herramientas', icon: Wrench },
      { title: 'Importar CSV', href: '/herramientas/importaciones', icon: FileSpreadsheet },
      { title: 'Convertir DBF', href: '/herramientas/convertir-dbf', icon: Database },
      { title: 'Actualizar Imágenes', href: '/herramientas/imagenes', icon: ImagePlus },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-sidebar md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sidebar-foreground">San Pablo</span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-3">
            {navigation.map((section) => (
              <div key={section.title}>
                <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
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
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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

        {/* Footer */}
        <div className="border-t p-4">
          <Separator className="mb-4" />
          <p className="text-xs text-sidebar-foreground/50 text-center">
            San Pablo Dashboard v2.0
          </p>
        </div>
      </div>
    </aside>
  );
}
