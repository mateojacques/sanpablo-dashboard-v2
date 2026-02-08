import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useTerms, useUpdateTerms } from '../api/content.queries';
import { legalTermsSchema, type LegalTermsFormData } from '@/lib/validations/content.schema';

export function TermsEditor() {
  const { data, isLoading } = useTerms();
  const updateTerms = useUpdateTerms();

  const form = useForm<LegalTermsFormData>({
    resolver: zodResolver(legalTermsSchema),
    defaultValues: {
      termsMarkdown: '',
    },
  });

  // Load data into form when available
  useEffect(() => {
    if (data?.data) {
      form.reset({
        termsMarkdown: data.data.termsMarkdown ?? '',
      });
    }
  }, [data, form]);

  const handleSubmit = async (formData: LegalTermsFormData) => {
    try {
      await updateTerms.mutateAsync(formData);
      toast.success('Términos y condiciones actualizados');
    } catch {
      toast.error('Error al guardar los términos y condiciones');
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Términos y Condiciones
            </CardTitle>
            <CardDescription>
              Define los términos y condiciones que los clientes deben aceptar.
            </CardDescription>
          </div>
          {data?.data?.lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última actualización: {formatDate(data.data.lastUpdated)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="termsMarkdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe aquí los términos y condiciones de tu tienda..."
                      rows={20}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Puedes usar texto plano o formato Markdown. Este contenido se mostrará
                    en la página de términos y condiciones de la tienda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateTerms.isPending}>
                {updateTerms.isPending ? (
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
