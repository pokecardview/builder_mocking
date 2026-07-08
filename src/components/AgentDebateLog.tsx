'use client';
import { useState } from 'react';

interface DebateEntry { agent: string; content: string; timestamp: string; }

export default function AgentDebateLog({ entries }: { entries: DebateEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  if (entries.length === 0) return null;

  return (
    <div className="border-t pt-2 mt-2">
      <button onClick={() => setExpanded(!expanded)} className="text-sm text-blue-600 hover:underline">
        {expanded ? 'Masquer' : 'Afficher'} le débat interne des agents
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {entries.map((entry, idx) => (
            <div key={idx} className="text-xs p-2 bg-gray-100 rounded">
              <span className="font-semibold capitalize">{entry.agent} :</span> {entry.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
