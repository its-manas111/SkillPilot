import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { SqlQueryResult } from '../../engine/evaluator/types';

interface SqlEditorProps {
  initialCode?: string;
  onRunQuery: (code: string) => Promise<SqlQueryResult>;
  onSubmit: (code: string, result: SqlQueryResult | null) => void;
  isSubmitting?: boolean;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  initialCode = '',
  onRunQuery,
  onSubmit,
  isSubmitting = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setQueryResult(null);
  }, [initialCode]);

  const lineCount = Math.max(5, code.split('\n').length);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const result = await onRunQuery(code);
      setQueryResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setQueryResult(null);
  };

  const handleSubmit = async () => {
    let result = queryResult;
    if (!result && code.trim()) {
      result = await onRunQuery(code);
      setQueryResult(result);
    }
    onSubmit(code, result);
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header Toolbar */}
      <div className="px-4 py-2.5 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SQL Editor</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-all"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3.5 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Query'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Answer'}</span>
          </button>
        </div>
      </div>

      {/* Code Textarea Area with Line Numbers */}
      <div className="relative flex-1 flex bg-dark-950 font-mono text-sm">
        {/* Line Numbers */}
        <div className="py-3 px-2 text-right bg-dark-900/60 text-slate-600 select-none border-r border-slate-800/40 text-xs w-10">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleRun();
            }
          }}
          placeholder="Write your SQL query here... (Ctrl+Enter to run)"
          className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none font-mono leading-relaxed selection:bg-cyan-500/30"
          spellCheck={false}
        />
      </div>

      {/* Results & Output Drawer */}
      <div className="border-t border-slate-800 bg-dark-900 flex flex-col max-h-56">
        <div className="px-4 py-2 bg-dark-850 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400">Results & Execution Preview</span>
          {queryResult && (
            <div className="flex items-center gap-3 text-slate-400">
              {queryResult.executionTimeMs !== undefined && (
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {queryResult.executionTimeMs} ms
                </span>
              )}
              {queryResult.values && (
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-cyan-400">
                  {queryResult.values.length} rows
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-3 overflow-auto flex-1 font-mono text-xs">
          {!queryResult && (
            <div className="text-slate-500 text-center py-4 italic">
              Click "Run Query" or press Ctrl+Enter to preview output table.
            </div>
          )}

          {queryResult?.error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-200">Execution Failed</div>
                <div className="text-xs">{queryResult.error}</div>
              </div>
            </div>
          )}

          {queryResult && !queryResult.error && (
            <div>
              {queryResult.values.length === 0 ? (
                <div className="text-slate-400 p-2 text-center">
                  Query executed successfully but returned 0 rows.
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-slate-800">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="p-2 whitespace-nowrap font-semibold text-slate-300">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-dark-950 text-slate-200">
                      {queryResult.values.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="p-2 whitespace-nowrap">
                              {val === null ? <span className="text-rose-400 italic">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
