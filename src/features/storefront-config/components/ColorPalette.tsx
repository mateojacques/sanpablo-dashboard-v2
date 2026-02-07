import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { useUpdateColors } from '../api/storefront-config.queries';
import { colorsSchema, type ColorsFormData } from '@/lib/validations/storefront.schema';
import type { ColorsConfig } from '../types';

type ColorPaletteProps = {
  initialData: ColorsConfig;
};

// Color input with preview
type ColorInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  error?: string;
};

function ColorInput({ value, onChange, label, description, error }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <div
          className="h-10 w-10 rounded-md border shrink-0 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.addEventListener('input', (e) => {
              onChange((e.target as HTMLInputElement).value);
            });
            input.click();
          }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ColorPalette({ initialData }: ColorPaletteProps) {
  const updateColors = useUpdateColors();

  const form = useForm<ColorsFormData>({
    resolver: zodResolver(colorsSchema),
    defaultValues: {
      primary: initialData.primary ?? '#3b82f6',
      secondary: initialData.secondary ?? '#64748b',
      accent: initialData.accent ?? '#f59e0b',
      background: initialData.background ?? '#ffffff',
      text: initialData.text ?? '#0f172a',
      textMuted: initialData.textMuted ?? '#64748b',
    },
  });

  const onSubmit = async (data: ColorsFormData) => {
    try {
      await updateColors.mutateAsync(data);
      toast.success('Colores actualizados correctamente');
    } catch {
      toast.error('Error al actualizar los colores');
    }
  };

  const values = form.watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Paleta de Colores
        </CardTitle>
        <CardDescription>
          Define los colores principales de tu tienda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview section */}
            <div className="rounded-lg border overflow-hidden">
              <div
                className="p-4"
                style={{ backgroundColor: values.background }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-bold"
                    style={{ color: values.primary }}
                  >
                    Header Preview
                  </span>
                  <div className="flex gap-2">
                    <div
                      className="px-3 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: values.primary }}
                    >
                      Primario
                    </div>
                    <div
                      className="px-3 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: values.accent }}
                    >
                      Acento
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: values.background,
                    color: values.text,
                  }}
                >
                  <p>Contenido de ejemplo con el color de texto principal.</p>
                  <p className="mt-2" style={{ color: values.textMuted }}>
                    Texto secundario para información adicional.
                  </p>
                  <p className="mt-2" style={{ color: values.secondary }}>
                    Color secundario de ejemplo.
                  </p>
                </div>
              </div>
            </div>

            {/* Color inputs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="primary"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Color primario"
                      description="Botones, enlaces, elementos destacados"
                      error={form.formState.errors.primary?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondary"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Color secundario"
                      description="Elementos secundarios, bordes"
                      error={form.formState.errors.secondary?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accent"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Color de acento"
                      description="Ofertas, badges, llamadas a acción"
                      error={form.formState.errors.accent?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="background"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Color de fondo"
                      description="Fondo principal de la página"
                      error={form.formState.errors.background?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Color de texto"
                      description="Texto principal del contenido"
                      error={form.formState.errors.text?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textMuted"
                render={({ field }) => (
                  <FormItem>
                    <ColorInput
                      value={field.value}
                      onChange={field.onChange}
                      label="Texto secundario"
                      description="Texto de menor importancia"
                      error={form.formState.errors.textMuted?.message}
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateColors.isPending}>
                {updateColors.isPending ? (
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
