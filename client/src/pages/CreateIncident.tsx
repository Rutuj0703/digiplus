import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Create Support Ticket</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" 
              placeholder="Brief summary of the issue" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea required rows={5} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" 
              placeholder="Provide detailed information, error codes, and steps to reproduce..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reporter</label>
            <input type="text" value={reporter} onChange={e => setReporter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" 
              placeholder="Your name" />
          </div>
          <button type="submit" disabled={loading}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Submitting & Running AI Categorization...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
