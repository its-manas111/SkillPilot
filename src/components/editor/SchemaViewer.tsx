import React, { useState } from 'react';
import { DatabaseSchemaContext } from '../../engine/questionBank/types';
import { Database, Table, Key, ChevronDown, ChevronRight, Eye } from 'lucide-react';

interface SchemaViewerProps {
  schema: DatabaseSchemaContext;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    [schema.tables[0]?.tableName || '']: true
  });
  const [activeSampleTable, setActiveSampleTable] = useState<string | null>(null);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full text-slate-300">
      <div className="px-4 py-3 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Database className="w-4 h-4" />
          <span>{schema.dbName}</span>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
          {schema.tables.length} tables
        </span>
      </div>

      <div className="p-3 overflow-y-auto flex-1 space-y-3">
        {schema.tables.map(table => {
          const isExpanded = !!expandedTables[table.tableName];
          const isSampleActive = activeSampleTable === table.tableName;

          return (
            <div key={table.tableName} className="border border-slate-800 rounded-lg overflow-hidden bg-dark-950/60">
              <button
                onClick={() => toggleTable(table.tableName)}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-slate-200">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <Table className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{table.tableName}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSampleTable(isSampleActive ? null : table.tableName);
                  }}
                  className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${
                    isSampleActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="View Sample Data"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Data</span>
                </button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 space-y-1 bg-dark-950/90">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Columns</div>
                  {table.columns.map(col => (
                    <div key={col.name} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/30 last:border-0">
                      <div className="flex items-center gap-1.5">
                        {col.isPrimary && <span title="Primary Key"><Key className="w-3 h-3 text-amber-400" /></span>}
                        {col.isForeign && <span title="Foreign Key"><Key className="w-3 h-3 text-sky-400" /></span>}
                        <span className={col.isPrimary ? 'text-amber-200 font-semibold' : 'text-slate-300'}>{col.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{col.type}</span>
                    </div>
                  ))}

                  {/* Sample Data Overlay */}
                  {isSampleActive && table.sampleRows.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <div className="text-[11px] font-semibold text-cyan-400 mb-1.5 flex items-center justify-between">
                        <span>Sample Rows</span>
                      </div>
                      <div className="overflow-x-auto max-h-36 rounded border border-slate-800">
                        <table className="w-full text-left text-[11px] font-mono">
                          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                            <tr>
                              {table.columns.map(c => (
                                <th key={c.name} className="p-1.5 whitespace-nowrap">{c.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 bg-dark-950">
                            {table.sampleRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/30">
                                {table.columns.map(c => (
                                  <td key={c.name} className="p-1.5 whitespace-nowrap text-slate-300">
                                    {row[c.name] === null ? <span className="text-rose-400 italic">NULL</span> : String(row[c.name])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
