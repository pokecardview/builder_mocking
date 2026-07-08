type DeploymentInfo = {
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  github_repo_url?: string;
  supabase_project_ref?: string;
  logs?: string;
};

export default function DeployStatus({ deployment }: { deployment: DeploymentInfo }) {
  const statusText = { pending:'En attente',in_progress:'En cours',success:'Réussi',failed:'Échoué' }[deployment.status];
  return (
    <div className="text-sm p-2 bg-gray-50 rounded">
      <p><strong>Statut :</strong> {statusText}</p>
      {deployment.github_repo_url && <p><strong>Repo GitHub :</strong> <a href={deployment.github_repo_url} target="_blank" className="text-blue-600 underline">{deployment.github_repo_url}</a></p>}
      {deployment.supabase_project_ref && <p><strong>Projet Supabase :</strong> {deployment.supabase_project_ref}</p>}
      {deployment.logs && <p className="text-red-600"><strong>Logs :</strong> {deployment.logs}</p>}
    </div>
  );
}
