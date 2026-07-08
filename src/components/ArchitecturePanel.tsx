interface ArchitecturePanelProps {
  files: Record<string, string>;
}

export default function ArchitecturePanel({ files }: ArchitecturePanelProps) {
  const fileNames = Object.keys(files);
  return (
    <div className="p-6 overflow-auto h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold"><i className="fas fa-sitemap text-[var(--accent)] mr-2"></i>Architecture</h2>
        <div className="text-xs text-[var(--text-tertiary)]">
          <span><i className="fas fa-file-code mr-1"></i>{fileNames.length} fichiers</span>
        </div>
      </div>
      <div className="font-mono text-sm space-y-1">
        {fileNames.map(name => (
          <div key={name} className="flex items-center gap-2 text-[var(--text-secondary)]">
            <i className="fas fa-file-code text-[var(--text-tertiary)] w-5"></i>
            <span>{name}</span>
            <span className="ml-auto text-xs text-[var(--text-muted)]">{files[name]?.length || 0} o</span>
          </div>
        ))}
      </div>
    </div>
  );
}
