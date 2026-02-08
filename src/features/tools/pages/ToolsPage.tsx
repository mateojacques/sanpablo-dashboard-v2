import { Link } from 'react-router-dom';
import { FileSpreadsheet, Upload, Database, ImagePlus, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';

const tools = [
  {
    title: 'Importacion en 1 Click',
    description: 'Importa productos desde un archivo DBF automaticamente. Sin pasos intermedios.',
    icon: Zap,
    href: '/herramientas/importacion-1-click',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    featured: true,
  },
  {
    title: 'Importar Productos (CSV)',
    description: 'Importa o actualiza productos masivamente desde un archivo CSV.',
    icon: FileSpreadsheet,
    href: '/herramientas/importaciones',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Nueva Importacion',
    description: 'Sube un nuevo archivo CSV para importar productos.',
    icon: Upload,
    href: '/herramientas/importaciones/nueva',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Convertir DBF a CSV',
    description: 'Convierte archivos DBF de tu sistema de inventario a formato CSV.',
    icon: Database,
    href: '/herramientas/convertir-dbf',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Actualizacion Masiva de Imagenes',
    description: 'Actualiza imagenes de productos masivamente desde un archivo JSON.',
    icon: ImagePlus,
    href: '/herramientas/imagenes',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export function ToolsPage() {
  return (
    <PageContainer
      title="Herramientas"
      description="Herramientas de administracion para gestion masiva de datos."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.href}
            className={`hover:shadow-md transition-shadow ${
              'featured' in tool && tool.featured
                ? 'ring-2 ring-yellow-400 ring-offset-2'
                : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  {'featured' in tool && tool.featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Nuevo
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>{tool.description}</CardDescription>
              <Button asChild variant="outline" className="w-full">
                <Link to={tool.href}>Acceder</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
