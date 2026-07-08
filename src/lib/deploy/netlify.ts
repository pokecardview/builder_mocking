export async function deployToNetlify(accessToken: string, repoUrl: string, siteName: string) {
  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: siteName,
      repo: {
        provider: 'github',
        repo: repoUrl,
        private: true,
        branch: 'main',
        cmd: 'npm run build',
        dir: '.next',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Netlify create site failed: ${response.status} ${errorText}`);
  }

  const site = await response.json();
  return {
    url: `https://${site.default_domain}`,
    siteId: site.id,
  };
}
