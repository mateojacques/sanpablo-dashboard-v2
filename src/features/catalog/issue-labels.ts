import type { PublicationIssue } from './types';

// Spanish labels for the API's publication issue codes
export const ISSUE_LABELS: Record<PublicationIssue, string> = {
  not_in_source: 'No está en la tabla del sistema',
  inactive: 'Desactivado',
  not_catalog_supplier: 'Otro proveedor',
  no_photo: 'Sin foto',
  no_price: 'Sin precio',
  price_outdated: 'Precio sin actualizar',
  duplicate: 'Duplicado',
  name_incomplete: 'Nombre cortado',
  no_rubro: 'Sin rubro',
  outside_batch: 'Fuera del lote',
};

export const DUPLICATE_HINT = 'Desactive los productos repetidos y deje uno activo.';
