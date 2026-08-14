import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents')
      .then(r => r.json())
      .then(data => setIncidents(data));
  }, []);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <Link to="/incidents/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">
          Create Incident
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold uppercase tracking-wider text-xs">Open Incidents</span>
          </div>
          <span className="text-4xl font-bold text-slate-800">{incidents.filter(i => i.status === 'OPEN').length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold uppercase tracking-wider text-xs">In Progress</span>
          </div>
          <span className="text-4xl font-bold text-slate-800">{incidents.filter(i => i.status === 'IN_PROGRESS').length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold uppercase tracking-wider text-xs">Resolved</span>
          </div>
          <span className="text-4xl font-bold text-slate-800">{incidents.filter(i => i.status === 'RESOLVED').length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Recent Incidents</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Ticket</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Title</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Category</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs tracking-wider">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.slice(0, 10).map(inc => (
              <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <Link to={`/incidents/${inc.id}`} className="text-blue-600 font-medium hover:underline">{inc.ticketNumber}</Link>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium truncate max-w-xs">{inc.title}</td>
                <td className="px-6 py-4 text-slate-600">{inc.categoryId || 'Unknown'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold tracking-wide
                    ${inc.status === 'OPEN' ? 'bg-red-100 text-red-800' : 
                      inc.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-emerald-100 text-emerald-800'}`}>
                    {inc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs rounded font-bold
                    ${inc.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 
                      inc.priority === 'HIGH' ? 'text-orange-600' : 'text-slate-600'}`}>
                    {inc.priority || 'MEDIUM'}
                  </span>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No active incidents found. Create one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
