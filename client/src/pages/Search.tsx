import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Database, MessageSquare } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/incidents/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Hybrid Search</h1>
      <p className="text-slate-600 font-medium">Search across historical tickets and knowledge articles using combined vector similarity and PostgreSQL full-text keyword matching.</p>
      
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="E.g. Database connection is returning ECONNREFUSED..."
          className="w-full px-6 py-4 pr-16 text-lg border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
        />
        <button type="submit" className="absolute right-3 top-2.5 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <SearchIcon className="w-5 h-5" />
        </button>
      </form>

      {loading && <div className="text-center py-10 font-medium text-slate-500 text-lg">Running Hybrid Ranked Fusion Search...</div>}

      {results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2"><MessageSquare className="text-blue-500"/> Historical Incidents</h2>
             {results.incidents?.map((inc: any) => (
                <div key={inc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-2">
                     <Link to={`/incidents/${inc.id}`} className="font-bold text-blue-600 hover:underline">{inc.ticketNumber}</Link>
                     <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">Score: {(inc._score * 100).toFixed(1)}</span>
                   </div>
                   <h3 className="font-semibold text-slate-800 line-clamp-1 mb-1">{inc.title}</h3>
                   <p className="text-sm text-slate-600 line-clamp-2">{inc.description}</p>
                   <div className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wide">
                     Matched via: {inc.source === 'hybrid' ? 'Vector + Keyword' : inc.source === 'vector' ? 'Semantic Vector' : 'Exact Keyword'}
                   </div>
                </div>
             ))}
             {results.incidents?.length === 0 && <div className="text-slate-500">No matching incidents.</div>}
          </div>

          <div className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2"><Database className="text-emerald-500"/> Knowledge Base</h2>
             {results.articles?.map((art: any) => (
                <div key={art.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-bold text-emerald-700">{art.title}</span>
                     <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Score: {(art._score * 100).toFixed(1)}</span>
                   </div>
                   <p className="text-sm text-slate-600 line-clamp-3">{art.content}</p>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Matched via: {art.source === 'hybrid' ? 'Vector + Keyword' : art.source === 'vector' ? 'Semantic Vector' : 'Exact Keyword'}
                      </span>
                      <span className="text-xs p-1 bg-slate-100 rounded text-slate-600">{art.category}</span>
                   </div>
                </div>
             ))}
             {results.articles?.length === 0 && <div className="text-slate-500">No knowledge articles matched.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
