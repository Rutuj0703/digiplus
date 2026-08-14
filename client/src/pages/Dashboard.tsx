import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents')
      .then(r => r.json())
      .then(data => setIncidents(data));
  }, []);

  return (
    <div className="space-y-10 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight glow-text">Overview</h1>
        <Link to="/incidents/new" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transition-all flex items-center gap-2">
          New Ticket <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors" />
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
               <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs">Action Required</span>
          </div>
          <span className="text-5xl font-extrabold text-slate-800">{incidents.filter(i => i.status === 'OPEN').length}</span>
        </div>
        
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
               <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs">In Progress</span>
          </div>
          <span className="text-5xl font-extrabold text-slate-800">{incidents.filter(i => i.status === 'IN_PROGRESS').length}</span>
        </div>
        
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
               <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs">Resolved</span>
          </div>
          <span className="text-5xl font-extrabold text-slate-800">{incidents.filter(i => i.status === 'RESOLVED').length}</span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white bg-white/40">
          <h2 className="text-xl font-bold text-slate-800 glow-text">Active Incidents</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/50 border-b border-white">
            <tr>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-xs tracking-wider">Ticket</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-xs tracking-wider">Title</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-xs tracking-wider">Category</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-xs tracking-wider">Status</th>
              <th className="px-8 py-5 font-bold text-slate-400 uppercase text-xs tracking-wider">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/50">
            {incidents.slice(0, 10).map(inc => (
              <tr key={inc.id} className="hover:bg-white/60 transition-colors group">
                <td className="px-8 py-5">
                  <Link to={`/incidents/${inc.id}`} className="text-indigo-400 font-semibold group-hover:text-indigo-300 group-hover:underline">
                    {inc.ticketNumber}
                  </Link>
                </td>
                <td className="px-8 py-5 text-slate-700 font-medium truncate max-w-xs">{inc.title}</td>
                <td className="px-8 py-5 text-slate-600 text-sm">
                  <span className="bg-white px-3 py-1 rounded-md border border-slate-200">
                    {inc.categoryId || 'Unknown'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 text-[11px] rounded-lg font-bold tracking-wider uppercase border 
                    ${inc.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      inc.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {inc.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 text-[11px] rounded-lg font-extrabold uppercase border
                    ${inc.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-600 border-red-500/30' : 
                      inc.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                      'bg-slate-100 text-slate-600 border-slate-300'}`}>
                    {inc.priority || 'MEDIUM'}
                  </span>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-4">
                     <CheckCircle2 className="w-12 h-12 text-slate-600" />
                     <span className="text-lg">No active incidents. You are all caught up!</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

