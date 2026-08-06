import React from 'react'
import { Database, Table, Key, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react'
import { NLPModuleItem } from '@/data/nlp300Catalog'

interface NLPSubModuleSchemaProps {
  activeModule: NLPModuleItem
}

export const NLPSubModuleSchema: React.FC<NLPSubModuleSchemaProps> = ({ activeModule }) => {
  const tableName = activeModule.databaseTable || `tbl_${activeModule.id.replace(/-/g, '_')}_logs`

  const columns = [
    { name: 'id', type: 'UUID / INTEGER', key: 'PRIMARY KEY', nullable: 'NO', desc: 'Unique record identifier' },
    { name: 'user_id', type: 'VARCHAR(255)', key: 'FOREIGN KEY', nullable: 'YES', desc: 'Reference to system users table' },
    { name: 'input_text', type: 'TEXT', key: '-', nullable: 'NO', desc: 'Raw prompt / payload input string' },
    { name: 'output_response', type: 'TEXT', key: '-', nullable: 'YES', desc: 'Model generated response / JSON' },
    { name: 'model_used', type: 'VARCHAR(100)', key: '-', nullable: 'NO', desc: 'Ollama model tag (e.g., llama3)' },
    { name: 'latency_ms', type: 'INTEGER', key: '-', nullable: 'NO', desc: 'Execution time in milliseconds' },
    { name: 'vector_score', type: 'FLOAT', key: '-', nullable: 'YES', desc: 'Semantic alignment vector distance' },
    { name: 'created_at', type: 'TIMESTAMP', key: '-', nullable: 'NO', desc: 'Timestamp of execution event' },
  ]

  const sqlDDL = `CREATE TABLE ${tableName} (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    module_id VARCHAR(100) NOT NULL DEFAULT '${activeModule.id}',
    input_text TEXT NOT NULL,
    output_response TEXT,
    model_used VARCHAR(100) NOT NULL DEFAULT 'llama3',
    latency_ms INTEGER NOT NULL DEFAULT 0,
    vector_score FLOAT DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_${tableName}_user ON ${tableName}(user_id);
CREATE INDEX idx_${tableName}_created ON ${tableName}(created_at);`

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Sub-Website Database Schema
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono">
                  {tableName}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Dedicated SQL table structure for storing execution logs, embeddings, and analytics for {activeModule.name}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>SQLAlchemy Persistence Ready</span>
          </div>
        </div>

        {/* Columns Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Column Name</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Constraints</th>
                <th className="p-3">Nullable</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition">
                  <td className="p-3 font-mono font-semibold text-primary">{col.name}</td>
                  <td className="p-3 font-mono text-foreground">{col.type}</td>
                  <td className="p-3">
                    {col.key !== '-' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md">
                        <Key className="w-3 h-3" />
                        {col.key}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">{col.nullable}</td>
                  <td className="p-3 text-muted-foreground">{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL DDL Viewer */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            <span>PostgreSQL / SQLite DDL Script</span>
          </h4>
          <span className="text-xs text-muted-foreground font-mono">SQLAlchemy Model Generated</span>
        </div>
        <pre className="bg-muted/80 p-4 rounded-xl font-mono text-xs text-foreground overflow-x-auto border border-border/80">
          <code>{sqlDDL}</code>
        </pre>
      </div>
    </div>
  )
}
