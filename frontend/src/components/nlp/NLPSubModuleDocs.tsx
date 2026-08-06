import React, { useState } from 'react'
import { Code, Copy, Check, Terminal, Globe, Server, Layers } from 'lucide-react'
import { NLPModuleItem } from '@/data/nlp300Catalog'
import toast from 'react-hot-toast'

interface NLPSubModuleDocsProps {
  activeModule: NLPModuleItem
}

export const NLPSubModuleDocs: React.FC<NLPSubModuleDocsProps> = ({ activeModule }) => {
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'js'>('curl')
  const [copied, setCopied] = useState(false)

  const endpoint = `/api/v1/nlp/modules/${activeModule.id}/execute`

  const curlSnippet = `curl -X POST "http://localhost:8000${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -d '{
    "module_id": "${activeModule.id}",
    "text": "${activeModule.sampleInput.replace(/'/g, "\\'")}",
    "model": "llama3",
    "temperature": 0.7,
    "top_k": 40,
    "system_prompt": "${activeModule.defaultPrompt.replace(/'/g, "\\'")}"
  }'`

  const pythonSnippet = `import requests

url = "http://localhost:8000${endpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
payload = {
    "module_id": "${activeModule.id}",
    "text": "${activeModule.sampleInput.replace(/"/g, '\\"')}",
    "model": "llama3",
    "temperature": 0.7,
    "top_k": 40,
    "system_prompt": "${activeModule.defaultPrompt.replace(/"/g, '\\"')}"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`

  const jsSnippet = `const response = await fetch('http://localhost:8000${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    module_id: '${activeModule.id}',
    text: "${activeModule.sampleInput.replace(/"/g, '\\"')}",
    model: 'llama3',
    temperature: 0.7,
    top_k: 40,
    system_prompt: "${activeModule.defaultPrompt.replace(/"/g, '\\"')}"
  })
});

const data = await response.json();
console.log(data);`

  const getActiveCode = () => {
    if (activeLang === 'curl') return curlSnippet
    if (activeLang === 'python') return pythonSnippet
    return jsSnippet
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode())
    setCopied(true)
    toast.success('API code snippet copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* API Overview Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                REST API Reference
                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  POST Endpoint
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Integration specs for sub-website module: <span className="text-foreground font-semibold">{activeModule.name}</span>
              </p>
            </div>
          </div>
          <div className="font-mono text-xs text-primary font-bold bg-muted px-3 py-1.5 rounded-xl border border-border">
            {endpoint}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
            Request Body Parameters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-card p-3 rounded-lg border border-border">
              <span className="font-mono text-primary font-bold">text</span> <span className="text-destructive font-mono text-[10px]">required</span>
              <p className="text-muted-foreground mt-1">Natural language input text or document content to process.</p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border">
              <span className="font-mono text-primary font-bold">model</span> <span className="text-muted-foreground font-mono text-[10px]">optional (default: llama3)</span>
              <p className="text-muted-foreground mt-1">Ollama model name (llama3, mistral, gemma, phi3, deepseek, codellama).</p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border">
              <span className="font-mono text-primary font-bold">temperature</span> <span className="text-muted-foreground font-mono text-[10px]">optional (default: 0.7)</span>
              <p className="text-muted-foreground mt-1">Sampling temperature controlling LLM creativity (0.0 - 1.0).</p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border">
              <span className="font-mono text-primary font-bold">system_prompt</span> <span className="text-muted-foreground font-mono text-[10px]">optional</span>
              <p className="text-muted-foreground mt-1">Custom system prompt overrides default module behavior.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {(['curl', 'python', 'js'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  activeLang === lang
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="bg-muted/90 p-4 rounded-xl font-mono text-xs text-foreground overflow-x-auto border border-border">
          <code>{getActiveCode()}</code>
        </pre>
      </div>
    </div>
  )
}
