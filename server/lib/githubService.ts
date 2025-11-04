// GitHub integration service
// Note: This will be activated once user sets up GitHub connection

export interface GitHubFile {
  path: string;
  content: string;
}

export async function getGitHubAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connection_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );

  const data = await response.json();
  const connection = data.items?.[0];

  if (!connection) {
    throw new Error('GitHub not connected');
  }

  return connection.settings.access_token;
}

export async function createOrUpdateGitHubRepo(
  repoName: string,
  files: GitHubFile[],
  description: string = 'Created from YOU–N–I–VERSE Studio'
) {
  const token = await getGitHubAccessToken();

  // Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const user = await userResponse.json();
  const username = user.login;

  // Check if repo exists
  const repoCheckResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  let repoUrl;

  if (repoCheckResponse.status === 404) {
    // Create new repo
    const createResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: false,
        auto_init: true,
      }),
    });

    const repo = await createResponse.json();
    repoUrl = repo.html_url;
  } else {
    const repo = await repoCheckResponse.json();
    repoUrl = repo.html_url;
  }

  // Upload files
  for (const file of files) {
    const contentBase64 = Buffer.from(file.content).toString('base64');

    // Check if file exists
    const fileCheckResponse = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let sha;
    if (fileCheckResponse.status === 200) {
      const existingFile = await fileCheckResponse.json();
      sha = existingFile.sha;
    }

    await fetch(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update ${file.path} from YOU–N–I–VERSE Studio`,
          content: contentBase64,
          sha,
        }),
      }
    );
  }

  return {
    url: repoUrl,
    username,
    repoName,
  };
}
