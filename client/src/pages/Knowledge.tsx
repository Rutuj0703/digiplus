export default function KnowledgePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Knowledge Base</h1>
      <p className="text-slate-600">The knowledge base is automatically populated and ingested into the vector database. Articles combine organically with incoming issues dynamically resolving them for users.</p>
      
      <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-500 italic text-center py-12">
        Knowledge articles are currently seeded from the dataset. Use Hybrid Search to query them.
      </div>
    </div>
  );
}
