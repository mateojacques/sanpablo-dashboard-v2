import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateSeo } from '../api/storefront-config.queries';
import { seoSchema, transformSeoData, type SeoFormData } from '@/lib/validations/storefront.schema';
import type { SeoConfig } from '../types';

type SeoSettingsProps = {
  initialData: SeoConfig;
};

export function SeoSettings({ initialData }: SeoSettingsProps) {
  const updateSeo = useUpdateSeo();

  const form = useForm<SeoFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      metaTitle: initialData.metaTitle ?? '',
      metaDescription: initialData.metaDescription ?? '',
      ogImage: initialData.ogImage ?? '',
    },
  });

  const onSubmit = async (data: SeoFormData) => {
    try {
      await updateSeo.mutateAsync(transformSeoData(data));
      toast.success('Configuración SEO actualizada');
    } catch {
      toast.error('Error al actualizar la configuración SEO');
    }
  };

  const metaTitle = form.watch('metaTitle');
  const metaDescription = form.watch('metaDescription');
  const ogImage = form.watch('ogImage');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO
        </CardTitle>
        <CardDescription>
          Optimiza tu tienda para motores de búsqueda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Google preview */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Vista previa en Google
              </p>
              <div className="space-y-1">
                <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                  {metaTitle || 'Título de tu tienda'}
                </p>
                <p className="text-green-700 text-sm">
                  https://tu-tienda.com
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {metaDescription ||
                    'La descripción de tu tienda aparecerá aquí. Usa hasta 160 caracteres para optimizar la visualización.'}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (Meta Title)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mi Tienda - Los mejores productos"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Título que aparece en los resultados de búsqueda ({(metaTitle?.length || 0)}/70 caracteres).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Meta Description)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción atractiva de tu tienda para los resultados de búsqueda..."
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción breve para buscadores ({(metaDescription?.length || 0)}/160 caracteres).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen para redes sociales (OG Image)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Imagen que se muestra al compartir en redes sociales (1200x630px recomendado).
                  </FormDescription>
                  <FormMessage />
                  {ogImage && (
                    <div className="mt-2 rounded-lg border overflow-hidden">
                      <img
                        src={ogImage}
                        alt="OG Image preview"
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateSeo.isPending}>
                {updateSeo.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
