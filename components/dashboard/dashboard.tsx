"use client";

import React, { useState } from "react";

export default function Dashboard() {
  const [code, setCode] = useState(`def login(username, password):
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    return db.execute(query)`);
  const [language, setLanguage] = useState("python");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);

  const handleRunAudit = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);

    try {
      // Points directly to your /api/generate route
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuditData(data);
      } else {
        alert("Audit Error: " + (data.error || "Failed to analyze code"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the backend server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ASTryx Security Workspace</h1>
          <p className="text-sm text-slate-400">Live AI-Powered Static Code Analysis</p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={isAnalyzing}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition cursor-pointer"
        >
          {isAnalyzing ? "Analyzing Code..." : "Run AI Audit"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Code Editor</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded border border-slate-700 focus:outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            className="w-full bg-slate-950 text-emerald-400 font-mono text-sm p-4 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            placeholder="Paste your code here..."
          />
        </div>

        {/* Audit Results Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Analysis Report</span>
          
          {!auditData && !isAnalyzing && (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center p-8">
              Paste or write any code on the left and click &quot;Run AI Audit&quot; to test.
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex items-center justify-center text-emerald-400 text-sm animate-pulse">
              Gemini AI is analyzing your code for security flaws...
            </div>
          )}

          {auditData && !isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Security Score</div>
                  <div className="text-3xl font-bold text-emerald-400">{auditData.score} / 100</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded">Crit: {auditData.critical || 0}</span>
                  <span className="bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded">High: {auditData.high || 0}</span>
                  <span className="bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded">Med: {auditData.medium || 0}</span>
                </div>
              </div>

              <div className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {auditData.summary}
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {auditData.findings?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-200">{item.title}</span>
                      <span className="text-red-400 bg-red-950/50 px-2 py-0.5 rounded">{item.severity}</span>
                    </div>
                    <p className="text-slate-400">{item.description}</p>
                    {item.patch && (
                      <pre className="bg-slate-900 p-2 rounded text-emerald-300 overflow-x-auto text-[11px]">
                        {item.patch}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
