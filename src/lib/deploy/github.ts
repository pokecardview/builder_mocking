import { Octokit } from '@octokit/rest';

export async function createGitHubRepo(name: string, token: string): Promise<string> {
  const octokit = new Octokit({ auth: token });
  const res = await octokit.repos.createForAuthenticatedUser({ name, private: true, auto_init: false });
  return res.data.clone_url;
}

export async function pushFilesToRepo(repoFullName: string, files: { path: string; content: string }[], token: string, commitMessage = 'Initial commit from ProdCoach') {
  const octokit = new Octokit({ auth: token });
  const [owner, repo] = repoFullName.split('/');
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const treeItems = await Promise.all(files.map(async file => {
    const blob = await octokit.git.createBlob({ owner, repo, content: file.content, encoding: 'utf-8' });
    return { path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.data.sha };
  }));
  const tree = await octokit.git.createTree({ owner, repo, tree: treeItems });
  const commit = await octokit.git.createCommit({ owner, repo, message: commitMessage, tree: tree.data.sha, parents: [ref.object.sha] });
  await octokit.git.updateRef({ owner, repo, ref: 'heads/main', sha: commit.data.sha });
  return true;
}
