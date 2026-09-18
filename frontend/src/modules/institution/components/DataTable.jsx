import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { cn } from '../../../shared/utils/cn';

/**
 * Componente DataTable Reutilizable y Accesible.
 * Incluye búsqueda en tiempo real, paginación, estados de carga y empty state.
 */
export const DataTable = ({
  title,
  description,
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = 'Buscar en los registros...',
  searchKeys = [],
  actionSlot,
  initialPageSize = 5,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtrado de datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key];
          return val && String(val).toLowerCase().includes(query);
        });
      }
      // Si no se especifican searchKeys, busca en todos los valores del objeto
      return Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchKeys]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reiniciar a página 1 al buscar
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden', className)}>
      {/* Barra Superior con Título, Búsqueda y Acciones */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title && (
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-sans"
              aria-label={searchPlaceholder}
            />
          </div>

          {actionSlot}
        </div>
      </div>

      {/* Contenedor de Tabla con Scroll Horizontal Responsivo */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse" role="table">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn('py-3.5 px-4 font-semibold', col.className)}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans">
            {isLoading ? (
              // Filas de Skeleton Loader
              [...Array(pageSize)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Inbox className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">No se encontraron registros</p>
                    <p className="text-xs text-slate-500">
                      {searchQuery
                        ? 'No hay resultados que coincidan con la búsqueda actual.'
                        : 'Aún no hay elementos registrados en esta sección.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Filas con datos reales
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || row.cuit || row.cuil || rowIdx}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('py-3.5 px-4 text-slate-700', col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación */}
      {!isLoading && filteredData.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Mostrando{' '}
              <strong className="text-slate-800 font-semibold">
                {(currentPage - 1) * pageSize + 1}
              </strong>{' '}
              a{' '}
              <strong className="text-slate-800 font-semibold">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </strong>{' '}
              de <strong className="text-slate-800 font-semibold">{filteredData.length}</strong>{' '}
              registros
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Registros por página"
            >
              <option value={5}>5 por pág.</option>
              <option value={10}>10 por pág.</option>
              <option value={20}>20 por pág.</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 py-1 text-xs font-medium text-slate-700">
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
