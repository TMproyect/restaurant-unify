
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ActivityPagination: React.FC<ActivityPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Número máximo de páginas a mostrar (sin contar ellipsis, prev y next)
  const MAX_VISIBLE_PAGES = 5;
  
  // Generar array con los números de página a mostrar
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      // Si hay menos páginas que el máximo, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Siempre mostrar la primera y la última página
    const pages: (number | 'ellipsis')[] = [1];
    
    // Calcular el rango de páginas a mostrar alrededor de la página actual
    const leftOffset = Math.floor((MAX_VISIBLE_PAGES - 3) / 2);
    const rightOffset = Math.ceil((MAX_VISIBLE_PAGES - 3) / 2);
    
    let startPage = Math.max(2, currentPage - leftOffset);
    let endPage = Math.min(totalPages - 1, currentPage + rightOffset);
    
    // Ajustar si estamos cerca del inicio
    if (currentPage - leftOffset < 2) {
      endPage = Math.min(totalPages - 1, MAX_VISIBLE_PAGES - 1);
    }
    
    // Ajustar si estamos cerca del final
    if (currentPage + rightOffset > totalPages - 1) {
      startPage = Math.max(2, totalPages - (MAX_VISIBLE_PAGES - 1));
    }
    
    // Añadir ellipsis al inicio si es necesario
    if (startPage > 2) {
      pages.push('ellipsis');
    }
    
    // Añadir páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Añadir ellipsis al final si es necesario
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Añadir última página (si hay más de una página)
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <Pagination>
      <PaginationContent>
        {/* Botón Anterior */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {/* Números de página */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => page !== currentPage && onPageChange(page)}
                className={page === currentPage ? '' : 'cursor-pointer'}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        {/* Botón Siguiente */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ActivityPagination;
