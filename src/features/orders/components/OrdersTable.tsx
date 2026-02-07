import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPrice, formatDate } from '@/lib/utils';
import { useDeleteOrder } from '../api/orders.queries';
import type { Order } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from '../types';

type OrdersTableProps = {
  orders: Order[];
  isLoading?: boolean;
};

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; order: Order | null }>({
    open: false,
    order: null,
  });

  const deleteOrder = useDeleteOrder();

  const handleDelete = async () => {
    if (!deleteDialog.order) return;

    try {
      await deleteOrder.mutateAsync(deleteDialog.order.id);
      toast.success('Orden eliminada correctamente');
      setDeleteDialog({ open: false, order: null });
    } catch {
      toast.error('Error al eliminar la orden');
    }
  };

  if (isLoading) {
    return <OrdersTableSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No hay ordenes"
        description="No se encontraron ordenes con los filtros seleccionados."
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N. Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                {/* Order Number */}
                <TableCell className="font-mono text-sm font-medium">
                  {order.orderNumber}
                </TableCell>

                {/* Customer Name */}
                <TableCell>
                  <div className="font-medium">{order.contactFullName}</div>
                  <div className="text-sm text-muted-foreground">{order.contactPhone}</div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-sm">{order.contactEmail}</TableCell>

                {/* Items count */}
                <TableCell className="text-center">
                  <Badge variant="outline">{order.items.length}</Badge>
                </TableCell>

                {/* Total */}
                <TableCell className="text-right font-medium">
                  {formatPrice(order.total)}
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>

                {/* Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, order })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, order: open ? deleteDialog.order : null })}
        title="Eliminar orden"
        description={`¿Estas seguro de que deseas eliminar la orden "${deleteDialog.order?.orderNumber}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteOrder.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N. Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="mb-1 h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="mx-auto h-5 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="mx-auto h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
