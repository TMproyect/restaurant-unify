
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { bulkRepairContentTypes, initializeStorage } from '@/services/storage/index';
import { toast } from 'sonner';

const MenuImagesRepair: React.FC = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStats, setRepairStats] = useState<{ fixed: number, total: number } | null>(null);
  const [progress, setProgress] = useState(0);
  
  const handleRepairImages = async () => {
    try {
      setIsRepairing(true);
      setProgress(10);
      
      // Inicializar almacenamiento primero
      await initializeStorage();
      setProgress(30);
      
      toast.info("Reparando imágenes...", {
        description: "Esto puede tomar unos momentos"
      });
      
      // Iniciar reparación
      setProgress(50);
      const result = await bulkRepairContentTypes();
      setProgress(100);
      
      setRepairStats(result);
      
      if (result.fixed > 0) {
        toast.success(`Reparación completada: ${result.fixed}/${result.total} imágenes corregidas`);
      } else if (result.total > 0) {
        toast.info(`No fue necesario reparar ninguna imagen (${result.total} revisadas)`);
      } else {
        toast.info("No se encontraron imágenes para reparar");
      }
    } catch (error) {
      console.error("Error al reparar imágenes:", error);
      toast.error("Error al reparar imágenes");
    } finally {
      setIsRepairing(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Reparación de imágenes</CardTitle>
        <CardDescription>
          Corrige problemas con tipos MIME de las imágenes del menú
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isRepairing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Reparando imágenes...</p>
            <Progress value={progress} className="h-2" />
          </div>
        ) : repairStats ? (
          <div className="flex items-center space-x-2">
            {repairStats.fixed > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            )}
            <span>
              {repairStats.fixed > 0 
                ? `${repairStats.fixed} de ${repairStats.total} imágenes reparadas` 
                : `${repairStats.total} imágenes revisadas, todas correctas`}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta herramienta corrige problemas de visualización de imágenes en el menú.
          </p>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleRepairImages} 
          disabled={isRepairing}
        >
          {isRepairing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reparando...
            </>
          ) : repairStats ? (
            "Reparar de nuevo"
          ) : (
            "Reparar imágenes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuImagesRepair;
