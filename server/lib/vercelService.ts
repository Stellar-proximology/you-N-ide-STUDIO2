interface VercelFile {
  path: string;
  content: string;
}

interface DeploymentResult {
  id: string;
  url?: string;
  inspectUrl?: string;
}

export async function deployToVercel(token: string, files: VercelFile[], projectName?: string) {
  if (!token) {
    throw new Error('Vercel token missing');
  }
  if (!files.length) {
    throw new Error('No files provided for deployment');
  }

  const payload = {
    name: projectName?.trim() || `you-n-i-verse-${Date.now()}`,
    files: files.map(file => ({
      file: file.path,
      data: Buffer.from(file.content || '', 'utf-8').toString('base64'),
      encoding: 'base64',
    })),
    projectSettings: {
      framework: null,
    },
  };

  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || error.message || 'Failed to create Vercel deployment');
  }

  const deployment: DeploymentResult & { readyState: string } = await response.json();

  let readyState = deployment.readyState;
  let attempts = 0;
  const maxAttempts = 60;

  while (readyState !== 'READY' && readyState !== 'ERROR' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const statusResponse = await fetch(`https://api.vercel.com/v13/deployments/${deployment.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const statusData = await statusResponse.json();
    readyState = statusData.readyState;
    attempts++;
  }

  if (readyState === 'ERROR') {
    throw new Error('Vercel deployment failed');
  }

  return {
    url: deployment.url ? `https://${deployment.url}` : undefined,
    deploymentId: deployment.id,
    inspectUrl: deployment.inspectUrl,
  };
}
