import { RefreshCw, Store, Palette, Image, Phone, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BrandingForm } from '../components/BrandingForm';
import { ColorPalette } from '../components/ColorPalette';
import { BannerManager } from '../components/BannerManager';
import { ContactForm } from '../components/ContactForm';
import { SeoSettings } from '../components/SeoSettings';
import { useStorefrontConfig } from '../api/storefront-config.queries';

export function StorefrontConfigPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useStorefrontConfig();

  if (isLoading) {
    return <StorefrontConfigPageSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <PageContainer title="Configuración de la Tienda">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-medium text-lg">Error al cargar la configuración</h3>
            <p className="text-muted-foreground mt-1">
              No se pudo obtener la configuración de la tienda.
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const config = data.data;

  return (
    <PageContainer
      title="Configuración de la Tienda"
      description="Personaliza la apariencia y configuración de tu tienda online"
      action={
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
          title="Recargar"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      }
    >
      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="branding" className="gap-2">
            <Store className="h-4 w-4 hidden sm:inline" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4 hidden sm:inline" />
            Colores
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <Image className="h-4 w-4 hidden sm:inline" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4 hidden sm:inline" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4 hidden sm:inline" />
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingForm initialData={config.branding} />
        </TabsContent>

        <TabsContent value="colors">
          <ColorPalette initialData={config.colors} />
        </TabsContent>

        <TabsContent value="banners">
          <BannerManager initialData={config.banners} />
        </TabsContent>

        <TabsContent value="contact">
          <ContactForm initialData={config.contact} />
        </TabsContent>

        <TabsContent value="seo">
          <SeoSettings initialData={config.seo} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function StorefrontConfigPageSkeleton() {
  return (
    <PageContainer
      title="Configuración de la Tienda"
      description="Personaliza la apariencia y configuración de tu tienda online"
    >
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-lg" />
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-36" />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
