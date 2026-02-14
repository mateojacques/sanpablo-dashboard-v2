import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Monitor,
  Smartphone,
  Type,
  MousePointerClick,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateBanners } from '../api/storefront-config.queries';
import type { BannerItem, HeroBannerItem, BannersConfig } from '../types';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────

type BannerManagerProps = {
  initialData: BannersConfig;
};

// ─── Form state types ─────────────────────────────────────────────────

type HeroBannerFormState = {
  imageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
};

type SlimBannerFormState = {
  imageUrl: string;
  altText: string;
  linkUrl: string;
  isActive: boolean;
};

const defaultHeroForm: HeroBannerFormState = {
  imageUrl: '',
  mobileImageUrl: '',
  title: '',
  subtitle: '',
  ctaText: '',
  ctaLink: '',
  isActive: true,
};

const defaultSlimForm: SlimBannerFormState = {
  imageUrl: '',
  altText: '',
  linkUrl: '',
  isActive: true,
};

type BannerType = 'hero' | 'slim';

// ─── Main component ──────────────────────────────────────────────────

export function BannerManager({ initialData }: BannerManagerProps) {
  const updateBanners = useUpdateBanners();

  const [heroBanners, setHeroBanners] = useState<HeroBannerItem[]>(initialData.hero ?? []);
  const [slimBanners, setSlimBanners] = useState<BannerItem[]>(initialData.slim ?? []);

  // Hero dialog state
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [editingHeroBanner, setEditingHeroBanner] = useState<HeroBannerItem | null>(null);
  const [heroForm, setHeroForm] = useState<HeroBannerFormState>(defaultHeroForm);

  // Slim dialog state
  const [slimDialogOpen, setSlimDialogOpen] = useState(false);
  const [editingSlimBanner, setEditingSlimBanner] = useState<BannerItem | null>(null);
  const [slimForm, setSlimForm] = useState<SlimBannerFormState>(defaultSlimForm);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ─── Drag & drop ─────────────────────────────────────────────────

  const handleHeroDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = heroBanners.findIndex((item) => item.id === active.id);
      const newIndex = heroBanners.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(heroBanners, oldIndex, newIndex);
      setHeroBanners(reordered.map((item, index) => ({ ...item, sortOrder: index })));
    }
  };

  const handleSlimDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slimBanners.findIndex((item) => item.id === active.id);
      const newIndex = slimBanners.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(slimBanners, oldIndex, newIndex);
      setSlimBanners(reordered.map((item, index) => ({ ...item, sortOrder: index })));
    }
  };

  // ─── Hero banner CRUD ────────────────────────────────────────────

  const openAddHeroDialog = () => {
    setEditingHeroBanner(null);
    setHeroForm(defaultHeroForm);
    setHeroDialogOpen(true);
  };

  const openEditHeroDialog = (banner: HeroBannerItem) => {
    setEditingHeroBanner(banner);
    setHeroForm({
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl ?? '',
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      ctaText: banner.ctaText ?? '',
      ctaLink: banner.ctaLink ?? '',
      isActive: banner.isActive ?? true,
    });
    setHeroDialogOpen(true);
  };

  const handleSaveHeroBanner = () => {
    if (!heroForm.imageUrl) {
      toast.error('La URL de la imagen desktop es requerida');
      return;
    }

    if (editingHeroBanner) {
      setHeroBanners((items) =>
        items.map((item) =>
          item.id === editingHeroBanner.id
            ? {
                ...item,
                imageUrl: heroForm.imageUrl,
                mobileImageUrl: heroForm.mobileImageUrl || undefined,
                title: heroForm.title || undefined,
                subtitle: heroForm.subtitle || undefined,
                ctaText: heroForm.ctaText || undefined,
                ctaLink: heroForm.ctaLink || undefined,
                isActive: heroForm.isActive,
              }
            : item
        )
      );
    } else {
      const newBanner: HeroBannerItem = {
        id: crypto.randomUUID(),
        imageUrl: heroForm.imageUrl,
        mobileImageUrl: heroForm.mobileImageUrl || undefined,
        title: heroForm.title || undefined,
        subtitle: heroForm.subtitle || undefined,
        ctaText: heroForm.ctaText || undefined,
        ctaLink: heroForm.ctaLink || undefined,
        isActive: heroForm.isActive,
        sortOrder: heroBanners.length,
      };
      setHeroBanners((items) => [...items, newBanner]);
    }

    setHeroDialogOpen(false);
    setHeroForm(defaultHeroForm);
  };

  // ─── Slim banner CRUD ────────────────────────────────────────────

  const openAddSlimDialog = () => {
    setEditingSlimBanner(null);
    setSlimForm(defaultSlimForm);
    setSlimDialogOpen(true);
  };

  const openEditSlimDialog = (banner: BannerItem) => {
    setEditingSlimBanner(banner);
    setSlimForm({
      imageUrl: banner.imageUrl,
      altText: banner.altText ?? '',
      linkUrl: banner.linkUrl ?? '',
      isActive: banner.isActive ?? true,
    });
    setSlimDialogOpen(true);
  };

  const handleSaveSlimBanner = () => {
    if (!slimForm.imageUrl) {
      toast.error('La URL de la imagen es requerida');
      return;
    }

    if (editingSlimBanner) {
      setSlimBanners((items) =>
        items.map((item) =>
          item.id === editingSlimBanner.id
            ? {
                ...item,
                imageUrl: slimForm.imageUrl,
                altText: slimForm.altText || undefined,
                linkUrl: slimForm.linkUrl || undefined,
                isActive: slimForm.isActive,
              }
            : item
        )
      );
    } else {
      const newBanner: BannerItem = {
        id: crypto.randomUUID(),
        imageUrl: slimForm.imageUrl,
        altText: slimForm.altText || undefined,
        linkUrl: slimForm.linkUrl || undefined,
        isActive: slimForm.isActive,
        sortOrder: slimBanners.length,
      };
      setSlimBanners((items) => [...items, newBanner]);
    }

    setSlimDialogOpen(false);
    setSlimForm(defaultSlimForm);
  };

  // ─── Shared actions ──────────────────────────────────────────────

  const handleDeleteBanner = (bannerId: string, type: BannerType) => {
    if (type === 'hero') {
      setHeroBanners((items) => items.filter((item) => item.id !== bannerId));
    } else {
      setSlimBanners((items) => items.filter((item) => item.id !== bannerId));
    }
  };

  const handleToggleActive = (bannerId: string, type: BannerType) => {
    if (type === 'hero') {
      setHeroBanners((items) =>
        items.map((item) =>
          item.id === bannerId ? { ...item, isActive: !item.isActive } : item
        )
      );
    } else {
      setSlimBanners((items) =>
        items.map((item) =>
          item.id === bannerId ? { ...item, isActive: !item.isActive } : item
        )
      );
    }
  };

  // ─── Save all ────────────────────────────────────────────────────

  const handleSaveAll = async () => {
    try {
      await updateBanners.mutateAsync({
        hero: heroBanners.map(
          ({ id, imageUrl, mobileImageUrl, title, subtitle, ctaText, ctaLink, isActive, sortOrder }) => ({
            id,
            imageUrl,
            mobileImageUrl,
            title,
            subtitle,
            ctaText,
            ctaLink,
            isActive,
            sortOrder,
          })
        ),
        slim: slimBanners.map(({ id, imageUrl, altText, linkUrl, isActive, sortOrder }) => ({
          id,
          imageUrl,
          altText,
          linkUrl,
          isActive,
          sortOrder,
        })),
      });
      toast.success('Banners actualizados correctamente');
    } catch {
      toast.error('Error al actualizar los banners');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Banners
            </CardTitle>
            <CardDescription>
              Gestiona los banners del carrusel principal y banners delgados.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hero">Banners Hero ({heroBanners.length})</TabsTrigger>
            <TabsTrigger value="slim">Banners Slim ({slimBanners.length})</TabsTrigger>
          </TabsList>

          {/* ── Hero banners tab ─────────────────────────────────── */}
          <TabsContent value="hero" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddHeroDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar banner hero
              </Button>
            </div>
            {heroBanners.length === 0 ? (
              <EmptyBannerState />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleHeroDragEnd}
              >
                <SortableContext
                  items={heroBanners.map((b) => b.id ?? '')}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {heroBanners.map((banner) => (
                      <SortableHeroBannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={() => openEditHeroDialog(banner)}
                        onDelete={() => handleDeleteBanner(banner.id ?? '', 'hero')}
                        onToggleActive={() => handleToggleActive(banner.id ?? '', 'hero')}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>

          {/* ── Slim banners tab ─────────────────────────────────── */}
          <TabsContent value="slim" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddSlimDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar banner slim
              </Button>
            </div>
            {slimBanners.length === 0 ? (
              <EmptyBannerState />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSlimDragEnd}
              >
                <SortableContext
                  items={slimBanners.map((b) => b.id ?? '')}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {slimBanners.map((banner) => (
                      <SortableSlimBannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={() => openEditSlimDialog(banner)}
                        onDelete={() => handleDeleteBanner(banner.id ?? '', 'slim')}
                        onToggleActive={() => handleToggleActive(banner.id ?? '', 'slim')}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} disabled={updateBanners.isPending}>
            {updateBanners.isPending ? (
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

        {/* ── Hero banner dialog ─────────────────────────────────── */}
        <HeroBannerDialog
          open={heroDialogOpen}
          onOpenChange={setHeroDialogOpen}
          form={heroForm}
          setForm={setHeroForm}
          isEditing={!!editingHeroBanner}
          onSave={handleSaveHeroBanner}
        />

        {/* ── Slim banner dialog ─────────────────────────────────── */}
        <SlimBannerDialog
          open={slimDialogOpen}
          onOpenChange={setSlimDialogOpen}
          form={slimForm}
          setForm={setSlimForm}
          isEditing={!!editingSlimBanner}
          onSave={handleSaveSlimBanner}
        />
      </CardContent>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────

function EmptyBannerState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
      <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-medium text-lg">Sin banners</h3>
      <p className="text-muted-foreground text-sm mt-1">
        Agrega banners para mostrar en la tienda.
      </p>
    </div>
  );
}

// ─── Image preview ────────────────────────────────────────────────────

type ImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
};

function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  return (
    <div className={cn('rounded-lg border overflow-hidden bg-muted', className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

// ─── Hero banner dialog ──────────────────────────────────────────────

type HeroBannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: HeroBannerFormState;
  setForm: React.Dispatch<React.SetStateAction<HeroBannerFormState>>;
  isEditing: boolean;
  onSave: () => void;
};

function HeroBannerDialog({
  open,
  onOpenChange,
  form,
  setForm,
  isEditing,
  onSave,
}: HeroBannerDialogProps) {
  const updateField = <K extends keyof HeroBannerFormState>(
    field: K,
    value: HeroBannerFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar banner hero' : 'Nuevo banner hero'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del banner hero.'
              : 'Agrega un nuevo banner para el carrusel principal.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ── Images section ──────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Imágenes
            </h4>

            {/* Desktop image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                Imagen desktop *
              </Label>
              <Input
                type="url"
                placeholder="https://... (imagen principal para escritorio)"
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
              />
              {form.imageUrl && (
                <ImagePreview src={form.imageUrl} alt="Preview desktop" className="h-36" />
              )}
            </div>

            {/* Mobile image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                Imagen mobile
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Opcional
                </Badge>
              </Label>
              <Input
                type="url"
                placeholder="https://... (versión optimizada para móviles)"
                value={form.mobileImageUrl}
                onChange={(e) => updateField('mobileImageUrl', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si no se proporciona, se usará la imagen desktop en todos los dispositivos.
              </p>
              {form.mobileImageUrl && (
                <ImagePreview
                  src={form.mobileImageUrl}
                  alt="Preview mobile"
                  className="h-48 max-w-[200px]"
                />
              )}
            </div>

            {/* Side-by-side preview when both images exist */}
            {form.imageUrl && form.mobileImageUrl && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Vista previa comparativa
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Monitor className="h-3 w-3" />
                      Desktop
                    </div>
                    <ImagePreview src={form.imageUrl} alt="Desktop" className="h-24" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Smartphone className="h-3 w-3" />
                      Mobile
                    </div>
                    <ImagePreview src={form.mobileImageUrl} alt="Mobile" className="h-24" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Content section ─────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Type className="h-4 w-4" />
              Contenido
            </h4>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Título del banner (máx. 100 caracteres)"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                maxLength={100}
              />
              {form.title && (
                <p className="text-xs text-muted-foreground text-right">
                  {form.title.length}/100
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                placeholder="Subtítulo o descripción breve (máx. 200 caracteres)"
                value={form.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                maxLength={200}
              />
              {form.subtitle && (
                <p className="text-xs text-muted-foreground text-right">
                  {form.subtitle.length}/200
                </p>
              )}
            </div>
          </div>

          {/* ── CTA section ────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <MousePointerClick className="h-4 w-4" />
              Llamada a la acción (CTA)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto del botón</Label>
                <Input
                  placeholder="Ej: Ver más, Comprar ahora"
                  value={form.ctaText}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Enlace del botón</Label>
                <Input
                  placeholder="https://... o /ruta-interna"
                  value={form.ctaLink}
                  onChange={(e) => updateField('ctaLink', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Active toggle ──────────────────────────────────── */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
            <Label>Banner activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isEditing ? 'Guardar cambios' : 'Agregar banner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Slim banner dialog ──────────────────────────────────────────────

type SlimBannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SlimBannerFormState;
  setForm: React.Dispatch<React.SetStateAction<SlimBannerFormState>>;
  isEditing: boolean;
  onSave: () => void;
};

function SlimBannerDialog({
  open,
  onOpenChange,
  form,
  setForm,
  isEditing,
  onSave,
}: SlimBannerDialogProps) {
  const updateField = <K extends keyof SlimBannerFormState>(
    field: K,
    value: SlimBannerFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar banner slim' : 'Nuevo banner slim'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del banner.'
              : 'Agrega un nuevo banner delgado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>URL de la imagen *</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
            />
            {form.imageUrl && (
              <ImagePreview src={form.imageUrl} alt="Preview" className="h-32" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Texto alternativo</Label>
            <Input
              placeholder="Descripción del banner"
              value={form.altText}
              onChange={(e) => updateField('altText', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>URL de enlace</Label>
            <Input
              type="url"
              placeholder="https://... (opcional)"
              value={form.linkUrl}
              onChange={(e) => updateField('linkUrl', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
            <Label>Banner activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isEditing ? 'Guardar cambios' : 'Agregar banner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sortable hero banner item ───────────────────────────────────────

type SortableHeroBannerItemProps = {
  banner: HeroBannerItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

function SortableHeroBannerItem({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableHeroBannerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id ?? '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = banner.isActive ?? true;
  const hasMobileImage = !!banner.mobileImageUrl;
  const hasContent = !!banner.title || !!banner.subtitle;
  const hasCta = !!banner.ctaText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border bg-background',
        isDragging && 'opacity-50 shadow-lg',
        !isActive && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Thumbnails */}
      <div className="flex gap-2 shrink-0">
        <div className="relative w-24 h-14 rounded overflow-hidden bg-muted">
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Banner hero'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute bottom-0.5 left-0.5">
            <Badge variant="secondary" className="text-[9px] px-1 py-0 leading-tight opacity-80">
              <Monitor className="h-2.5 w-2.5" />
            </Badge>
          </div>
        </div>
        {hasMobileImage && (
          <div className="relative w-10 h-14 rounded overflow-hidden bg-muted">
            <img
              src={banner.mobileImageUrl}
              alt={`${banner.title || 'Banner hero'} mobile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute bottom-0.5 left-0.5">
              <Badge variant="secondary" className="text-[9px] px-1 py-0 leading-tight opacity-80">
                <Smartphone className="h-2.5 w-2.5" />
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Banner info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium truncate text-sm">
          {banner.title || 'Sin título'}
        </p>
        {banner.subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {banner.subtitle}
          </p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasMobileImage && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile
            </Badge>
          )}
          {hasCta && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
              <MousePointerClick className="h-3 w-3" />
              {banner.ctaText}
            </Badge>
          )}
          {!hasContent && !hasMobileImage && !hasCta && (
            <span className="text-xs text-muted-foreground">Solo imagen</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleActive}
          title={isActive ? 'Desactivar' : 'Activar'}
        >
          {isActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Sortable slim banner item ───────────────────────────────────────

type SortableSlimBannerItemProps = {
  banner: BannerItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

function SortableSlimBannerItem({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableSlimBannerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id ?? '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isActive = banner.isActive ?? true;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border bg-background',
        isDragging && 'opacity-50 shadow-lg',
        !isActive && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Banner image thumbnail */}
      <div className="w-24 h-14 rounded overflow-hidden bg-muted shrink-0">
        <img
          src={banner.imageUrl}
          alt={banner.altText || 'Banner'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Banner info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {banner.altText || 'Sin descripción'}
        </p>
        {banner.linkUrl && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
            <ExternalLink className="h-3 w-3" />
            {banner.linkUrl}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleActive}
          title={isActive ? 'Desactivar' : 'Activar'}
        >
          {isActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>

        <Button variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
