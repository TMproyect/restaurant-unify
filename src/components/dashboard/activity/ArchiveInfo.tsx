
import React from 'react';
import { Info, Loader2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ArchiveInfoProps {
  lastArchiveRun: string | null;
  autoArchiveEnabled: boolean;
  archivingInProgress: boolean;
  archivableCount: number;
  onArchiveClick: () => void;
}

const getLastArchiveText = (lastArchiveRun: string | null): string => {
  if (!lastArchiveRun) return 'Nunca';
  
  try {
    const date = new Date(lastArchiveRun);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Fecha desconocida';
  }
};

const ArchiveInfo: React.FC<ArchiveInfoProps> = ({
  lastArchiveRun,
  autoArchiveEnabled,
  archivingInProgress,
  archivableCount,
  onArchiveClick
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Último archivado: {getLastArchiveText(lastArchiveRun)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">
              {autoArchiveEnabled 
                ? 'El archivado automático está habilitado. Las órdenes antiguas se archivarán automáticamente.' 
                : 'El archivado automático está deshabilitado. Puede archivar órdenes manualmente.'}
            </p>
            <p className="text-xs mt-1">
              Configurar en: Ajustes &gt; Archivado
            </p>
          </TooltipContent>
        </Tooltip>
        
        <Badge
          variant="outline" 
          className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={onArchiveClick}
        >
          {archivingInProgress ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Archivando...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Archive className="h-3 w-3" />
              Archivar ({archivableCount})
            </span>
          )}
        </Badge>
      </div>
    </TooltipProvider>
  );
};

export default ArchiveInfo;
