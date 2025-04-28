
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import MenuItemForm from './MenuItemForm';
import MenuItemImage from './MenuItemImage';
import { MenuCategory } from '@/services/menu/categoryService';
import { MenuItem, fetchMenuItems, deleteMenuItem } from '@/services/menu/menuItemService';
import { 
  Loader2, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Info, 
  Circle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MenuManagerProps {
  categories: MenuCategory[];
  isLoading: boolean;
  storageInitialized?: boolean;
}

const MenuManager: React.FC<MenuManagerProps> = ({ categories, isLoading, storageInitialized = false }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [forceDelete, setForceDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isDeleting, setIsDeleting] = useState(false); // Fixed: initialize with false instead of isDeleting
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(12);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Función para obtener los elementos del menú con paginación
  const loadMenuItems = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      
      const currentPage = resetPage ? 1 : page;
      if (resetPage) {
        setPage(1);
      }
      
      const result = await fetchMenuItems({
        page: currentPage,
        pageSize,
        categoryId: filterCategory === "all" ? undefined : filterCategory || undefined,
        searchTerm: searchTerm || undefined
      });
      
      setItems(result.items);
      setTotalItems(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error al cargar elementos del menú:', error);
      toast.error('No se pudieron cargar los elementos del menú');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCategory, searchTerm]);

  // Cargar elementos cuando cambien los filtros o la página
  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems, page, refreshKey]);

  // Escuchar evento de actualización
  useEffect(() => {
    const handleMenuUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('menuItemsUpdated', handleMenuUpdate);
    
    return () => {
      window.removeEventListener('menuItemsUpdated', handleMenuUpdate);
    };
  }, []);

  // Aplicar filtros
  const handleSearch = useCallback(() => {
    loadMenuItems(true);
  }, [loadMenuItems]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    setPage(1);
    setTimeout(() => loadMenuItems(true), 0);
  };

  // Paginación
  const handleNextPage = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  // Formulario de ítem
  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleItemFormClose = (saved: boolean) => {
    setShowItemForm(false);
    if (saved) {
      loadMenuItems();
    }
  };

  // Eliminación de ítem
  const confirmDelete = (item: MenuItem) => {
    setItemToDelete(item);
    setForceDelete(false);
  };

  const handleDeleteCancel = () => {
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteMenuItem(itemToDelete.id, forceDelete);
      
      if (success) {
        toast.success('Elemento eliminado con éxito');
        loadMenuItems();
      } else if (!forceDelete) {
        toast.error('No se pudo eliminar el elemento porque está siendo usado en pedidos');
        setForceDelete(true);
        return;
      } else {
        toast.error('Error al eliminar el elemento');
      }
      
      setItemToDelete(null);
      setForceDelete(false);
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      toast.error('Error al eliminar el elemento');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  };

  // Renderizar componente de carga
  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden">
          <div className="h-44 bg-muted animate-pulse"></div>
          <CardHeader className="pb-2">
            <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          </CardContent>
          <CardFooter>
            <div className="h-9 bg-muted animate-pulse rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex gap-2 w-full lg:w-auto">
          <Button 
            onClick={handleAddItem} 
            className="gap-2"
            disabled={!storageInitialized}
          >
            <Plus className="h-4 w-4" /> Añadir plato
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar platos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleSearch} size="icon" className="flex-shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {loading || isLoading ? (
        renderLoadingSkeleton()
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
          <Info className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No hay platos disponibles</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm || filterCategory 
              ? "No se encontraron platos con los filtros aplicados." 
              : "Todavía no hay platos en el menú. Comience añadiendo su primer plato."}
          </p>
          <Button onClick={handleAddItem} className="gap-2">
            <Plus className="h-4 w-4" /> Añadir plato
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                <div className="relative">
                  <MenuItemImage 
                    imageUrl={item.image_url || ''} 
                    alt={item.name}
                  />
                  {item.popular && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                    </Badge>
                  )}
                  {!item.available && (
                    <Badge variant="outline" className="absolute top-2 left-2 bg-background/80">
                      No disponible
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                    <Badge variant="outline" className="ml-2 whitespace-nowrap">
                      {getCategoryName(item.category_id)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description || "Sin descripción"}
                  </p>
                  <p className="text-lg font-medium mt-2">{formatPrice(item.price)}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex w-full gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => confirmDelete(item)}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Eliminar
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Paginación */}
          <div className="flex justify-between items-center pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {items.length} de {totalItems} elementos
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={page <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={!hasMore}
                className="gap-1"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Formulario para crear/editar platos */}
      {showItemForm && (
        <MenuItemForm
          item={selectedItem}
          categories={categories}
          onClose={handleItemFormClose}
        />
      )}

      {/* Confirmación para eliminar plato */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {forceDelete 
                ? "¿Eliminar permanentemente este plato?" 
                : "¿Eliminar este plato?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {forceDelete ? (
                <div className="space-y-2 py-2">
                  <p>
                    Este plato está asociado a pedidos existentes. Eliminarlo afectará los registros históricos.
                  </p>
                  <p>
                    <strong className="text-destructive">Esta acción no se puede deshacer</strong> y podría causar 
                    problemas en la visualización de pedidos antiguos.
                  </p>
                  <p>
                    En lugar de eliminar, considera marcar el plato como no disponible.
                  </p>
                </div>
              ) : (
                "Esta acción no se puede deshacer. El plato será eliminado permanentemente."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>Eliminar{forceDelete ? " permanentemente" : ""}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManager;
