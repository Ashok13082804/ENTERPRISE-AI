import React, { useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { analyzerApi } from '../services/analyzerApi';

interface AnalysisHistoryPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({ setCurrentTab }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await analyzerApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter(h =>
    h.filename.toLowerCase().includes(search.toLowerCase()) ||
    h.report_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Analysis <span className="cyber-gradient-text">History & Archive</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical logs of all dynamic document analyses, executed module counts, and exported reports.
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="px-3 py-2 rounded-lg bg-dark-900 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by document name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg bg-dark-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-dark-900/60 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Analysis Runs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a document or choose a benchmark preset on the Document Analyzer to begin logging runs.
          </p>
          {setCurrentTab && (
            <button
              onClick={() => setCurrentTab('analyzer')}
              className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all"
            >
              Go to Document Analyzer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-dark-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Document / File</th>
                <th className="p-4">Type</th>
                <th className="p-4">Modules Run</th>
                <th className="p-4">Latency</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.map((h, i) => (
                <tr key={i} className="hover:bg-dark-850/60 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-200 text-sm">{h.filename}</div>
                    <div className="text-[11px] text-slate-500">{h.report_title}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                      {h.file_type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="font-bold text-emerald-400">{h.completed_modules}</span> /{' '}
                    <span>{h.applicable_modules}</span>
                    <span className="text-slate-500 text-[10px] ml-1">({h.skipped_modules} skipped)</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{h.execution_time}s</td>
                  <td className="p-4 text-slate-500">{h.timestamp}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistoryPage;

