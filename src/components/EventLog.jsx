import React, { useState } from 'react';
import { Terminal, Filter, Copy, Check, Trash2, Search } from 'lucide-react';

export default function EventLog({ simulationEngine, simulationState }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const events = simulationState.events || [];

  const categories = ['ALL', 'TASK', 'BID', 'COLLISION', 'RESOURCE', 'BATTERY', 'FAILURE'];

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = activeCategory === 'ALL' || evt.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      evt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'TASK': return 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
      case 'BID': return 'bg-purple-950/80 text-purple-400 border-purple-800';
      case 'COLLISION': return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'RESOURCE': return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'BATTERY': return 'bg-yellow-950/80 text-yellow-400 border-yellow-800';
      case 'FAILURE': return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleCopyLogs = () => {
    const text = filteredEvents
      .map(e => `[${e.timestamp} | Tick #${e.tick}] [${e.category}] ${e.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0B0F19] rounded-xl border border-slate-800 flex flex-col h-full shadow-xl overflow-hidden font-mono">
      {/* Console Top Bar */}
      <div className="px-4 py-2.5 bg-[#0F1629] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Industrial Event Telemetry Console
          </span>
          <span className="text-[10px] text-slate-500">
            ({events.length} logged events)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLogs}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Export Logs'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="px-4 py-2 bg-[#0D1322] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter messages..."
            className="pl-7 pr-3 py-1 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-600 italic text-xs">
            No telemetry records matching filter criteria
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="py-1 px-2 rounded hover:bg-slate-900/60 transition-colors flex items-start space-x-2 text-[11.5px] leading-relaxed border-l-2 border-transparent hover:border-cyan-400"
            >
              <span className="text-slate-500 shrink-0 font-mono text-[10.5px]">
                [{evt.timestamp}]
              </span>
              <span className="text-slate-600 shrink-0 font-mono text-[10px]">
                #T{evt.tick}
              </span>
              <span className={`px-1.5 py-0.2 rounded border text-[9.5px] font-bold shrink-0 uppercase ${getCategoryBadge(evt.category)}`}>
                {evt.category}
              </span>
              <span className="text-slate-300 break-words flex-1">
                {evt.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
