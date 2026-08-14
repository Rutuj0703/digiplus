import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Search, BookOpen } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import IncidentDetails from './pages/IncidentDetails';
import CreateIncident from './pages/CreateIncident';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 py-6 px-4 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
          <Ticket className="w-6 h-6 text-blue-400" />
          ResolveAI
        </h1>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/incidents/new" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <PlusCircle className="w-5 h-5" /> Create Ticket
          </Link>
          <Link to="/search" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Search className="w-5 h-5" /> Hybrid Search
          </Link>
          <div className="mt-6 uppercase text-xs font-semibold text-slate-500 tracking-wider px-3">Knowledge</div>
          <Link to="/knowledge" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" /> Knowledge Base
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50 relative">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700">IT Service Desk</h2>
        </header>

        <div className="p-8 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents/new" element={<CreateIncident />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/search" element={<div>Search implementation</div>} />
            <Route path="/knowledge" element={<div>Knowledge Base</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
