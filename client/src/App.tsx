import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Search, BookOpen, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import IncidentDetails from './pages/IncidentDetails';
import CreateIncident from './pages/CreateIncident';

function App() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-transparent text-slate-800 font-sans overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-400/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 floating-sidebar flex flex-col gap-6 py-8 px-5 z-10">
        <div className="flex items-center gap-3 px-2 mb-4 group cursor-default">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity" />
             <div className="relative bg-white border border-indigo-100 p-2 rounded-lg shadow-sm">
                <Activity className="w-6 h-6 text-indigo-600" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">DigiPlusAI</h1>
        </div>
        
        <nav className="flex flex-col gap-3">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-white/80 text-indigo-700 border border-white shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-medium">Overview</span>
          </Link>
          <Link to="/incidents/new" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/incidents/new') ? 'bg-white/80 text-indigo-700 border border-white shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}>
            <PlusCircle className="w-5 h-5" /> <span className="font-medium">New Ticket</span>
          </Link>
          <Link to="/search" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/search') ? 'bg-white/80 text-indigo-700 border border-white shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}>
            <Search className="w-5 h-5" /> <span className="font-medium">Intelligence</span>
          </Link>
          
          <div className="mt-6 px-4 uppercase text-[10px] font-bold text-slate-400 tracking-[0.2em]">Knowledge Center</div>
          
          <Link to="/knowledge" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/knowledge') ? 'bg-white/80 text-indigo-700 border border-white shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}>
            <BookOpen className="w-5 h-5" /> <span className="font-medium">Library</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass-header flex items-center justify-between px-10 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-semibold text-slate-800 tracking-tight">IT Service Engine</h2>
             <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM ONLINE
             </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer">
               A
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-10 overflow-y-auto h-full scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents/new" element={<CreateIncident />} />
              <Route path="/incidents/:id" element={<IncidentDetails />} />
              <Route path="/search" element={<div className="fade-in"><h1 className="text-3xl font-bold">Search Implementation</h1></div>} />
              <Route path="/knowledge" element={<div className="fade-in"><h1 className="text-3xl font-bold">Knowledge Base</h1></div>} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
