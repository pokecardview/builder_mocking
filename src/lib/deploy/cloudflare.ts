export async function deployToCloudflare(apiToken: string, accountId: string, repoUrl: string, projectName: string) {
  const repoPath = repoUrl.replace('https://github.com/', '').replace('.git', '');
  const [owner, repo] = repoPath.split('/');

  const projRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, production_branch: 'main' }),
  });
  if (!projRes.ok) throw new Error(`Cloudflare project creation error: ${projRes.status}`);
  const project = await projRes.json();

  const deployRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${project.result.name}/deployments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: {
          type: 'github',
          config: { owner, repo_name: repo, production_branch: 'main', pr_comments_enabled: false },
        },
      }),
    }
  );
  if (!deployRes.ok) throw new Error(`Cloudflare deploy trigger error: ${deployRes.status}`);
  const deploy = await deployRes.json();
  return { url: `https://${project.result.subdomain}.pages.dev`, projectName: project.result.name };
}
