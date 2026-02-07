import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useUpdateBranding } from '../api/storefront-config.queries';
import {
  brandingSchema,
  transformBrandingData,
  type BrandingFormData,
} from '@/lib/validations/storefront.schema';
import type { BrandingConfig } from '../types';

type BrandingFormProps = {
  initialData: BrandingConfig;
};

export function BrandingForm({ initialData }: BrandingFormProps) {
  const updateBranding = useUpdateBranding();

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      storeName: initialData.storeName ?? '',
      tagline: initialData.tagline ?? '',
      headerLogoUrl: initialData.headerLogoUrl ?? '',
      footerLogoUrl: initialData.footerLogoUrl ?? '',
      faviconUrl: initialData.faviconUrl ?? '',
    },
  });

  const onSubmit = async (data: BrandingFormData) => {
    try {
      await updateBranding.mutateAsync(transformBrandingData(data));
      toast.success('Marca actualizada correctamente');
    } catch {
      toast.error('Error al actualizar la marca');
    }
  };

  const headerLogoUrl = form.watch('headerLogoUrl');
  const faviconUrl = form.watch('faviconUrl');
  const footerLogoUrl = form.watch('footerLogoUrl');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Marca e Identidad
        </CardTitle>
        <CardDescription>
          Configura el nombre de la tienda, logos y favicon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la tienda *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Tienda" {...field} />
                  </FormControl>
                  <FormDescription>
                    El nombre que se mostrará en el header y título de la página.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eslogan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu tienda de arte y libros"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Frase corta que describe tu tienda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Header logo */}
              <FormField
                control={form.control}
                name="headerLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo del header</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>URL del logo para el header.</FormDescription>
                    <FormMessage />
                    {headerLogoUrl && (
                      <div className="mt-2 rounded-lg border p-4 bg-muted/30">
                        <img
                          src={headerLogoUrl}
                          alt="Logo preview"
                          className="max-h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Favicon */}
              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Icono pequeño que aparece en la pestaña del navegador (32x32px recomendado).
                    </FormDescription>
                    <FormMessage />
                    {faviconUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="rounded border p-2 bg-muted/30">
                          <img
                            src={faviconUrl}
                            alt="Favicon preview"
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">Vista previa</span>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* Footer logo */}
            <FormField
              control={form.control}
              name="footerLogoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo del footer</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Logo alternativo para el pie de página (opcional).
                  </FormDescription>
                  <FormMessage />
                  {footerLogoUrl && (
                    <div className="mt-2 rounded-lg border p-4 bg-muted/30">
                      <img
                        src={footerLogoUrl}
                        alt="Footer logo preview"
                        className="max-h-12 object-contain"
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
              <Button type="submit" disabled={updateBranding.isPending}>
                {updateBranding.isPending ? (
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
