import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2 } from 'lucide-react';

export default function CreateIncident() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, reporter })
      });
      const data = await res.json();
      navigate(`/incidents/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in pb-10">
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-extrabold text-slate-800 glow-text">Raise a Ticket</h1>
         <p className="text-slate-600">Our AI agent will automatically categorize and prioritize your request.</p>
      </div>
      
      <div className="glass-panel p-10 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        
        <form onSubmit={handleSubmit} className="relative space-y-6 z-10">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-indigo-700 uppercase tracking-wider">Issue Summary</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-white/60 backdrop-blur-md border border-white rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all glow-box" 
              placeholder="e.g. Cannot connect to Office VPN" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-indigo-700 uppercase tracking-wider">Detailed Description</label>
            <textarea required rows={6} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-white/60 backdrop-blur-md border border-white rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all glow-box" 
              placeholder="Provide error codes, exact steps to reproduce, and any impact details..." />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-indigo-700 uppercase tracking-wider">Reporter Name</label>
            <input type="text" value={reporter} onChange={e => setReporter(e.target.value)}
              className="w-full px-5 py-3 bg-white/60 backdrop-blur-md border border-white rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all glow-box" 
              placeholder="John Doe" />
          </div>
          
          <div className="pt-6">
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all flex justify-center items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                 <>
                   <Loader2 className="w-6 h-6 animate-spin" />
                   Initializing AI Engine...
                 </>
              ) : (
                 <>
                   <Send className="w-5 h-5" />
                   Submit to AI Triage
                 </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
