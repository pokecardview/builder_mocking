import { NetlifyAPI } from 'netlify';

export async function deployToNetlify(accessToken: string, repoUrl: string, siteName: string) {
  const client = new NetlifyAPI(accessToken, {});
  const site = await client.createSite({
    body: {
      name: siteName,
      repo: {
        provider: 'github',
        repo: repoUrl,
        private: true,
        branch: 'main',
        cmd: 'npm run build',
        dir: '.next',
      },
    },
  });
  await client.createSiteBuild({ site_id: site.id });
  return {
    url: `https://${site.default_domain}`,
    siteId: site.id,
  };
}
