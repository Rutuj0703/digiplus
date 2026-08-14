import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, Bug, Code, FileText, CheckCircle2 } from 'lucide-react';

export default function IncidentDetails() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [analysisRes, setAnalysisRes] = useState<any>(null);
  const [linkingJira, setLinkingJira] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/incidents/${id}`)
      .then(res => res.json())
      .then(data => setIncident(data));
  }, [id]);

  const analyzeWithAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(`http://localhost:5000/api/incidents/${id}/analyze`, { method: 'POST' });
      const data = await res.json();
      setAnalysisRes(data);
      if (data.analysis) {
         setIncident((prev: any) => ({ ...prev, AIAnalysis: data.analysis }));
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const createJira = async () => {
    setLinkingJira(true);
    try {
      const res = await fetch(`http://localhost:5000/api/incidents/${id}/jira`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to link Jira');
      } else {
        setIncident((prev: any) => ({ ...prev, JiraIssue: data }));
      }
    } catch (e: any) {
      alert("Error linking Jira");
    } finally {
      setLinkingJira(false);
    }
  };

  if (!incident) return <div className="p-8">Loading ticket...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {incident.ticketNumber}
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide
                ${incident.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 
                  incident.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'}`}>
                {incident.priority || 'MEDIUM'}
              </span>
            </h1>
            <p className="text-lg text-slate-600 mt-1">{incident.title}</p>
          </div>
          <div className="text-right">
             <div className="text-sm font-semibold text-slate-500 uppercase">Status</div>
             <div className="text-lg font-bold text-slate-800">{incident.status}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
           <div>
             <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Description</h3>
             <p className="text-slate-700 whitespace-pre-wrap">{incident.description}</p>
           </div>
           <div>
             <h3 className="text-sm font-semibold text-slate-500 uppercase mb-1">Categorization</h3>
             <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {incident.categoryId || 'Unknown Category'}
                </span>
                {incident.CategoryPrediction?.[0] && (
                  <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Bot className="w-3 h-3"/> AI Predicted ({(incident.CategoryPrediction[0].confidence * 100).toFixed(0)}%)
                  </span>
                )}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white"><Bot className="w-5 h-5 text-blue-400"/> AI Analysis</h2>
              {!incident.AIAnalysis && (
                <button onClick={analyzeWithAI} disabled={loadingAI} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-sm transition-colors disabled:opacity-50">
                  {loadingAI ? 'Analyzing Incident...' : 'Analyze with AI'}
                </button>
              )}
            </div>
            <div className="p-6">
              {incident.AIAnalysis ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Summary</div>
                    <p className="text-slate-300">{incident.AIAnalysis.summary}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Probable Cause</div>
                    <p className="text-white bg-slate-800 p-3 rounded-lg border border-slate-700">{incident.AIAnalysis.probableCause}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Recommended Resolution</div>
                    <p className="text-emerald-400 font-medium">{incident.AIAnalysis.recommendedResolution}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Troubleshooting Steps</div>
                    <ul className="list-decimal pl-5 space-y-1 text-slate-300">
                      {incident.AIAnalysis.troubleshootingSteps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic text-center py-6">Run AI analysis to review retrieved knowledge and determine probable cause.</p>
              )}
            </div>
          </div>

          {analysisRes?.sources && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800"><FileText className="w-5 h-5 text-blue-600"/> RAG Context Retrieved</h2>
               </div>
               <div className="p-6 space-y-6">
                  <div>
                     <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 border-b pb-2">Historical Incidents</h3>
                     <div className="space-y-3">
                        {analysisRes.sources.incidents?.slice(0,3).map((r: any) => (
                           <div key={r.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                              <div className="font-semibold text-blue-900">{r.ticketNumber}: {r.title}</div>
                              <div className="text-sm text-slate-600 mt-1">Relevance: {(r._score * 100).toFixed(1)} (Hybrid)</div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 border-b pb-2">Knowledge Base</h3>
                     <div className="space-y-3">
                        {analysisRes.sources.articles?.slice(0,3).map((r: any) => (
                           <div key={r.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                              <div className="font-semibold text-emerald-900">{r.title}</div>
                              <div className="text-sm text-slate-600 mt-1">Relevance: {(r._score * 100).toFixed(1)} (Hybrid)</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800"><Bug className="w-5 h-5 text-blue-600"/> Engineering / Jira</h2>
              {incident.JiraIssue ? (
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <div className="font-bold text-blue-700 text-lg hover:underline"><a href={incident.JiraIssue.issueUrl} target="_blank" rel="noreferrer">{incident.JiraIssue.issueKey}</a></div>
                    <div className="text-sm text-slate-600 mt-1 line-clamp-2">{incident.JiraIssue.summary}</div>
                    <div className="mt-3 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold inline-block">{incident.JiraIssue.status}</div>
                 </div>
              ) : (
                <button onClick={createJira} disabled={linkingJira} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded outline-none border border-slate-300 transition-colors">
                  {linkingJira ? 'Creating...' : 'Create Jira Issue'}
                </button>
              )}
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800"><Code className="w-5 h-5 text-slate-700"/> GitHub PR</h2>
              {incident.GitHubLink && incident.GitHubLink.length > 0 ? (
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <div className="font-bold text-slate-800 hover:underline"><a href={incident.GitHubLink[0].pullRequestUrl} target="_blank" rel="noreferrer">PR #{incident.GitHubLink[0].pullRequestNumber}</a></div>
                    <div className="text-sm text-slate-600 mt-1 break-all">Commit: {incident.GitHubLink[0].latestCommitSha?.slice(0, 7)}</div>
                    <div className="mt-3 flex items-center justify-between">
                       <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">{incident.GitHubLink[0].status}</span>
                       <span className={`text-xs font-bold flex items-center gap-1 ${incident.GitHubLink[0].ciStatus === 'PASSED' ? 'text-green-600' : 'text-slate-500'}`}><CheckCircle2 className="w-4 h-4"/> CI: {incident.GitHubLink[0].ciStatus}</span>
                    </div>
                 </div>
              ) : (
                <div className="text-center text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-100">
                  No PR linked yet.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
