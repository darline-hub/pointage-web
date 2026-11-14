import React, { useState } from 'react';
import {useReactTable,getCoreRowModel,getPaginationRowModel,getFilteredRowModel,flexRender,ColumnDef,} from '@tanstack/react-table';
import { Search, Calendar, Download, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// Définition du type 
interface Pointage {
  id: number;
  employe: string;
  departement: string;
  poste: string;
  date: string;
  arrivee: string;
  depart: string;
  statut: 'À l’heure' | 'En retard';
}

const initialPointages: Pointage[] = [
  { id: 1, employe: 'Jean Dupont', departement: 'Heritage', poste: 'Chargé de clientèle', date: '2026-11-14', arrivee: '07:52', depart: '17:00', statut: 'À l’heure' },
  { id: 2, employe: 'Marie Claire', departement: 'OpenDoors', poste: 'Gestionnaire locatif', date: '2026-11-14', arrivee: '08:15', depart: '--:--', statut: 'En retard' },
  { id: 3, employe: 'Paul Biya', departement: 'Eko-Flash', poste: 'Logisticien', date: '2026-11-14', arrivee: '07:45', depart: '--:--', statut: 'À l’heure' },
  { id: 4, employe: 'Sophie Mballa', departement: 'Dimensions', poste: 'Consultante Audit', date: '2026-11-13', arrivee: '08:30', depart: '17:10', statut: 'En retard' },
];

export default function Pointages() {
  const [data] = useState<Pointage[]>(initialPointages);
  const [globalFilter, setGlobalFilter] = useState('');

  // Définition des colonnes avec typage ColumnDef
  const columns = React.useMemo<ColumnDef<Pointage>[]>(
    () => [
      {
        accessorKey: 'employe',
        header: 'Employé',
        cell: info => <span className="font-medium text-gray-900">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'departement',
        header: 'Département',
        cell: info => <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'poste',
        header: 'Poste',
        cell: info => <span className="text-gray-600">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'date',
        header: 'Date',
      },
      {
        accessorKey: 'arrivee',
        header: 'Heure Arrivée',
        cell: info => (
          <div className="flex items-center gap-1.5 text-gray-700">
            <Clock size={16} className="text-blue-500" />
            <span>{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'depart',
        header: 'Heure Départ',
      },
      {
        accessorKey: 'statut',
        header: 'Statut',
        cell: info => {
          const statut = info.getValue() as string;
          const isLate = statut === 'En retard';
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isLate ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isLate ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
              {statut}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi des Pointages</h1>
          <p className="text-sm text-gray-500">Supervisez les arrivées, les départs et les retards en temps réel.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          <Download size={16} />
          Exporter le Rapport (Excel)
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Rechercher par employé, département, poste, statut..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={18} className="text-gray-400" />
          <span>Filtre par date</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    Aucun pointage trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> sur {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition"
            >
              Précédent
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100 transition"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}