'use client';
import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

interface GeneratedFile { file_path: string; content: string; }

export default function CodeViewer({ files }: { files: GeneratedFile[] }) {
  const [selectedFile, setSelectedFile] = useState<string>(files[0]?.file_path || '');
  const [previewHtml, setPreviewHtml] = useState<string>('');

  const currentFile = files.find(f => f.file_path === selectedFile) || files[0];
  const highlighted = useMemo(() => {
    if (!currentFile) return '';
    const lang = currentFile.file_path.endsWith('.tsx') || currentFile.file_path.endsWith('.ts') ? 'typescript' :
                 currentFile.file_path.endsWith('.css') ? 'css' : 'markup';
    return Prism.highlight(currentFile.content, Prism.languages[lang] || Prism.languages.markup, lang);
  }, [currentFile]);

  // Fonction pour préparer une preview : on combine les fichiers en un seul HTML
  const openPreview = () => {
    const htmlFiles = files.filter(f => f.file_path.endsWith('.html') || f.file_path.endsWith('.tsx') || f.file_path.endsWith('.jsx'));
    // Pour simplifier, on prend le contenu de tous les fichiers TSX et on les injecte dans un iframe sandboxé
    const combined = htmlFiles.map(f => `<!-- ${f.file_path} -->\n${f.content}`).join('\n');
    setPreviewHtml(combined);
  };

  return (
    <div className="flex h-full border rounded bg-white">
      {/* Liste des fichiers */}
      <div className="w-1/5 border-r overflow-y-auto p-2">
        <h3 className="font-bold text-sm mb-2">📁 Fichiers</h3>
        {files.map(f => (
          <div
            key={f.file_path}
            className={`text-xs p-1 cursor-pointer hover:bg-gray-100 ${f.file_path === selectedFile ? 'bg-blue-100' : ''}`}
            onClick={() => setSelectedFile(f.file_path)}
          >
            {f.file_path}
          </div>
        ))}
      </div>
      {/* Code source */}
      <div className="w-2/5 p-2 overflow-y-auto border-r">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">💻 {currentFile?.file_path}</h3>
          <button onClick={openPreview} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">▶ Lancer la preview</button>
        </div>
        <pre className="text-xs overflow-x-auto bg-gray-50 p-2 rounded"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
      </div>
      {/* Preview */}
      <div className="w-2/5 p-2">
        <h3 className="font-bold text-sm mb-2">🖥️ Preview de l'application</h3>
        {previewHtml ? (
          <iframe
            sandbox="allow-scripts allow-same-origin"
            srcDoc={previewHtml}
            className="w-full h-96 border"
          />
        ) : (
          <p className="text-xs text-gray-500">Cliquez sur "Lancer la preview" pour voir le résultat.</p>
        )}
      </div>
    </div>
  );
}
