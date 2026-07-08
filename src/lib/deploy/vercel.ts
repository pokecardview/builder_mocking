export async function deployToVercel(accessToken: string, repoUrl: string, projectName: string) {
  const repoPath = repoUrl.replace('https://github.com/', '').replace('.git', '');
  const projRes = await fetch('https://api.vercel.com/v10/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, framework: 'nextjs', gitRepository: { type: 'github', repo: repoPath } }),
  });
  if (!projRes.ok) throw new Error(`Vercel project creation error: ${projRes.status}`);
  const project = await projRes.json();

  const deployRes = await fetch(`https://api.vercel.com/v13/deployments?projectId=${project.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: 'production', gitSource: { type: 'github', repo: repoPath, ref: 'main' } }),
  });
  if (!deployRes.ok) throw new Error(`Vercel deploy trigger error: ${deployRes.status}`);
  const deploy = await deployRes.json();
  return { url: `https://${deploy.url}`, projectId: project.id };
}
