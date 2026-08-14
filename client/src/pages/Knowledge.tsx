import { useEffect, useState } from 'react';
import { Book, ChevronRight } from 'lucide-react';

export default function KnowledgePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/knowledge')
      .then(r => r.json())
      .then(data => {
        setArticles(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Knowledge Base</h1>
        <p className="text-slate-600">The knowledge base is automatically populated and ingested into the vector database. Search dynamically combines context from these articles.</p>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading articles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map(article => (
            <div key={article.id} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg whitespace-nowrap">
                    {article.category || 'General'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {article.content}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Book className="w-4 h-4" /> Read Article
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="col-span-2 bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-sm text-slate-500 italic text-center py-12">
              No knowledge articles currently seeded in the dataset.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
