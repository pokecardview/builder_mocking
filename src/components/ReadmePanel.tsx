export default function ReadmePanel() {
  return (
    <div className="p-6 overflow-auto h-full text-sm leading-relaxed text-[var(--text-secondary)]">
      <h1 className="text-2xl font-extrabold text-white mb-4">📘 Product Intelligence Automated Team</h1>
      <p className="mb-4"><strong>Version PRO</strong> — YC + McKinsey + Blue Ocean + Agentic AI + HITL Optimizer</p>
      <div className="border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] p-4 rounded mb-4">
        <strong>But :</strong> fichier maître exploitable par un modèle IA pour lancer automatiquement la conception d’un produit.
      </div>
      <h2 className="text-lg font-bold text-white mt-6 mb-2">1. Résumé et objectifs</h2>
      <p>Construire une équipe produit automatisée capable de produire un <strong>Product Intelligence Report</strong> et un <strong>MVP vendable</strong>.</p>
      <h2 className="text-lg font-bold text-white mt-6 mb-2">2. Agents</h2>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Market Analyst</li><li>Product Designer</li><li>UI/UX Designer</li><li>Product Manager</li>
        <li>Tech Lead</li><li>Data Engineer</li><li>Full‑Stack Engineer</li><li>QA Reviewer</li>
        <li>HITL Optimizer</li><li>Orchestrator</li>
      </ol>
      <h2 className="text-lg font-bold text-white mt-6 mb-2">3. Diagramme</h2>
      <pre className="bg-[var(--bg-surface)] border border-[var(--border-soft)] p-4 rounded-lg text-xs overflow-x-auto">
{`flowchart LR
  MA[Market Analyst] --> PD[Product Designer]
  PD --> UX[UI/UX]
  UX --> PM[Product Manager]
  PM --> TL[Tech Lead]
  TL --> FE[Full‑Stack]
  FE --> QA[QA]
  QA --> OR[Orchestrator]
  OR --> HITL[HITL Optimizer]
  HITL --> PM
`}
      </pre>
    </div>
  );
}
