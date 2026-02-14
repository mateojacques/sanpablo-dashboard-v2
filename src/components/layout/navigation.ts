import type { ComponentType } from 'react';
import {
  FolderTree,
  HelpCircle,
  ImagePlus,
  Images,
  LayoutDashboard,
  Package,
  Palette,
  FileText,
  ShoppingCart,
  Wrench,
  Zap,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
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
    items: [{ title: 'Apariencia', href: '/storefront', icon: Palette }],
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
      { title: 'Importación en 1 Click', href: '/herramientas/importacion-1-click', icon: Zap },
      { title: 'Actualizar Imágenes', href: '/herramientas/imagenes', icon: ImagePlus },
      // { title: 'Importar CSV', href: '/herramientas/importaciones', icon: FileSpreadsheet },
      // { title: 'Convertir DBF', href: '/herramientas/convertir-dbf', icon: Database },
    ],
  },
];
