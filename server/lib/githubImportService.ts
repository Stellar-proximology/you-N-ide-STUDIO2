export async function importGitHubRepo(repoUrl: string) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/zipball`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'YOU-N-I-VERSE IDE',
        'Accept': 'application/vnd.github.v3+json',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const zipBuffer = await response.arrayBuffer();
    
    return {
      success: true,
      repoName,
      owner,
      zipData: Buffer.from(zipBuffer),
      url: repoUrl,
    };
  } catch (error: any) {
    console.error('GitHub import error:', error);
    throw new Error(error.message || 'Failed to import repository');
  }
}
