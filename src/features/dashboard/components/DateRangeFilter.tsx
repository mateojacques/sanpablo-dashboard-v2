import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MetricsParams } from '../types';

type DateRangeFilterProps = {
  onChange: (params: MetricsParams) => void;
  isLoading?: boolean;
};

type PresetOption = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

function toIsoStartOfDay(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map((v) => Number(v));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)).toISOString();
}

function toIsoEndOfDay(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map((v) => Number(v));
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999)).toISOString();
}

function getDateRange(preset: PresetOption): MetricsParams {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'all':
      return {};
    case 'today':
      return { startDate: toIsoStartOfDay(today), endDate: toIsoEndOfDay(today) };
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const start = weekAgo.toISOString().split('T')[0];
      return { startDate: toIsoStartOfDay(start), endDate: toIsoEndOfDay(today) };
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const start = monthAgo.toISOString().split('T')[0];
      return { startDate: toIsoStartOfDay(start), endDate: toIsoEndOfDay(today) };
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const start = yearAgo.toISOString().split('T')[0];
      return { startDate: toIsoStartOfDay(start), endDate: toIsoEndOfDay(today) };
    }
    default:
      return {};
  }
}

export function DateRangeFilter({ onChange, isLoading }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetOption>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value);
    if (value !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
      onChange(getDateRange(value));
    }
  };

  const handleApplyCustom = () => {
    if (customStart || customEnd) {
      onChange({
        startDate: customStart ? toIsoStartOfDay(customStart) : undefined,
        endDate: customEnd ? toIsoEndOfDay(customEnd) : undefined,
      });
    }
  };

  const handleClearFilter = () => {
    setPreset('all');
    setCustomStart('');
    setCustomEnd('');
    onChange({});
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Total historico</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Ultimos 7 dias</SelectItem>
            <SelectItem value="month">Ultimo mes</SelectItem>
            <SelectItem value="year">Ultimo ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === 'custom' && (
        <>
          <div className="space-y-1">
            <Label htmlFor="startDate" className="text-xs">
              Desde
            </Label>
            <Input
              id="startDate"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate" className="text-xs">
              Hasta
            </Label>
            <Input
              id="endDate"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <Button
            onClick={handleApplyCustom}
            disabled={isLoading || (!customStart && !customEnd)}
            size="sm"
          >
            Aplicar
          </Button>
        </>
      )}

      {preset !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilter}
          className="text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
