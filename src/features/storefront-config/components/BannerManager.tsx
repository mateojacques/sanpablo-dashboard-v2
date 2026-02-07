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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import type { BannerItem, BannersConfig } from '../types';
import { cn } from '@/lib/utils';

type BannerManagerProps = {
  initialData: BannersConfig;
};

type BannerFormState = {
  imageUrl: string;
  altText: string;
  linkUrl: string;
  isActive: boolean;
};

const defaultBannerForm: BannerFormState = {
  imageUrl: '',
  altText: '',
  linkUrl: '',
  isActive: true,
};

type BannerType = 'hero' | 'slim';

export function BannerManager({ initialData }: BannerManagerProps) {
  const updateBanners = useUpdateBanners();

  const [heroBanners, setHeroBanners] = useState<BannerItem[]>(initialData.hero ?? []);
  const [slimBanners, setSlimBanners] = useState<BannerItem[]>(initialData.slim ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormState>(defaultBannerForm);
  const [activeBannerType, setActiveBannerType] = useState<BannerType>('hero');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, type: BannerType) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const setBanners = type === 'hero' ? setHeroBanners : setSlimBanners;
      const banners = type === 'hero' ? heroBanners : slimBanners;

      const oldIndex = banners.findIndex((item) => item.id === active.id);
      const newIndex = banners.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(banners, oldIndex, newIndex);
      // Update sortOrder
      setBanners(newItems.map((item, index) => ({ ...item, sortOrder: index })));
    }
  };

  const openAddDialog = (type: BannerType) => {
    setActiveBannerType(type);
    setEditingBanner(null);
    setBannerForm(defaultBannerForm);
    setDialogOpen(true);
  };

  const openEditDialog = (banner: BannerItem, type: BannerType) => {
    setActiveBannerType(type);
    setEditingBanner(banner);
    setBannerForm({
      imageUrl: banner.imageUrl,
      altText: banner.altText ?? '',
      linkUrl: banner.linkUrl ?? '',
      isActive: banner.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSaveBanner = () => {
    if (!bannerForm.imageUrl) {
      toast.error('La URL de la imagen es requerida');
      return;
    }

    const setBanners = activeBannerType === 'hero' ? setHeroBanners : setSlimBanners;
    const banners = activeBannerType === 'hero' ? heroBanners : slimBanners;

    if (editingBanner) {
      // Update existing
      setBanners((items) =>
        items.map((item) =>
          item.id === editingBanner.id
            ? {
                ...item,
                imageUrl: bannerForm.imageUrl,
                altText: bannerForm.altText || undefined,
                linkUrl: bannerForm.linkUrl || undefined,
                isActive: bannerForm.isActive,
              }
            : item
        )
      );
    } else {
      // Add new
      const newBanner: BannerItem = {
        id: crypto.randomUUID(),
        imageUrl: bannerForm.imageUrl,
        altText: bannerForm.altText || undefined,
        linkUrl: bannerForm.linkUrl || undefined,
        isActive: bannerForm.isActive,
        sortOrder: banners.length,
      };
      setBanners((items) => [...items, newBanner]);
    }

    setDialogOpen(false);
    setBannerForm(defaultBannerForm);
  };

  const handleDeleteBanner = (bannerId: string, type: BannerType) => {
    const setBanners = type === 'hero' ? setHeroBanners : setSlimBanners;
    setBanners((items) => items.filter((item) => item.id !== bannerId));
  };

  const handleToggleActive = (bannerId: string, type: BannerType) => {
    const setBanners = type === 'hero' ? setHeroBanners : setSlimBanners;
    setBanners((items) =>
      items.map((item) =>
        item.id === bannerId ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      await updateBanners.mutateAsync({
        hero: heroBanners.map(({ id, imageUrl, altText, linkUrl, isActive, sortOrder }) => ({
          id,
          imageUrl,
          altText,
          linkUrl,
          isActive,
          sortOrder,
        })),
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

  const renderBannerList = (banners: BannerItem[], type: BannerType) => (
    <>
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg">Sin banners</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Agrega banners para mostrar en la tienda.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => handleDragEnd(e, type)}
        >
          <SortableContext
            items={banners.map((b) => b.id ?? '')}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {banners.map((banner) => (
                <SortableBannerItem
                  key={banner.id}
                  banner={banner}
                  onEdit={() => openEditDialog(banner, type)}
                  onDelete={() => handleDeleteBanner(banner.id ?? '', type)}
                  onToggleActive={() => handleToggleActive(banner.id ?? '', type)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  );

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

          <TabsContent value="hero" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openAddDialog('hero')}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar banner hero
              </Button>
            </div>
            {renderBannerList(heroBanners, 'hero')}
          </TabsContent>

          <TabsContent value="slim" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openAddDialog('slim')}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar banner slim
              </Button>
            </div>
            {renderBannerList(slimBanners, 'slim')}
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

        {/* Add/Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Editar banner' : `Nuevo banner ${activeBannerType}`}
              </DialogTitle>
              <DialogDescription>
                {editingBanner
                  ? 'Modifica los datos del banner.'
                  : `Agrega un nuevo banner ${activeBannerType === 'hero' ? 'principal' : 'delgado'}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>URL de la imagen *</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={bannerForm.imageUrl}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, imageUrl: e.target.value })
                  }
                />
                {bannerForm.imageUrl && (
                  <div className="mt-2 rounded-lg border overflow-hidden">
                    <img
                      src={bannerForm.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.alt = 'Error loading image';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Texto alternativo</Label>
                <Input
                  placeholder="Descripción del banner"
                  value={bannerForm.altText}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, altText: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>URL de enlace</Label>
                <Input
                  type="url"
                  placeholder="https://... (opcional)"
                  value={bannerForm.linkUrl}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, linkUrl: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={bannerForm.isActive}
                  onCheckedChange={(checked) =>
                    setBannerForm({ ...bannerForm, isActive: checked })
                  }
                />
                <Label>Banner activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBanner}>
                {editingBanner ? 'Guardar cambios' : 'Agregar banner'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

type SortableBannerItemProps = {
  banner: BannerItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

function SortableBannerItem({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableBannerItemProps) {
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
