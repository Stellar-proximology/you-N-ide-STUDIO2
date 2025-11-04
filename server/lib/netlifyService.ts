interface NetlifyFile {
  path: string;
  content: string;
}

export async function deployToNetlify(
  apiKey: string,
  files: NetlifyFile[],
  siteName?: string
) {
  try {
    // Step 1: Create or use existing site
    let siteId: string;
    
    if (siteName) {
      // Try to find existing site by name
      const sitesResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const sites = await sitesResponse.json();
      const existingSite = sites.find((site: any) => 
        site.name === siteName || site.custom_domain === `${siteName}.netlify.app`
      );

      if (existingSite) {
        siteId = existingSite.id;
      } else {
        // Create new site
        const createResponse = await fetch('https://api.netlify.com/api/v1/sites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: siteName,
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.message || 'Failed to create site');
        }

        const site = await createResponse.json();
        siteId = site.id;
      }
    } else {
      // Create anonymous site
      const createResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || 'Failed to create site');
      }

      const site = await createResponse.json();
      siteId = site.id;
    }

    // Step 2: Calculate SHA1 hashes for files
    const crypto = await import('crypto');
    const fileDigest: Record<string, string> = {};
    
    for (const file of files) {
      // Validate that file has content (defensive check - allow empty strings)
      if (file.content === undefined || file.content === null || typeof file.content !== 'string') {
        console.warn(`Skipping file ${file.path} - no valid content`);
        continue;
      }
      
      const hash = crypto.createHash('sha1')
        .update(file.content)
        .digest('hex');
      fileDigest[file.path] = hash;
    }

    // Step 3: Create deploy
    const deployResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: fileDigest }),
      }
    );

    if (!deployResponse.ok) {
      const error = await deployResponse.json();
      throw new Error(error.message || 'Failed to create deploy');
    }

    const deploy = await deployResponse.json();
    const deployId = deploy.id;
    const requiredFiles = deploy.required || [];

    // Step 4: Upload required files
    for (const sha of requiredFiles) {
      // Find which file matches this SHA
      const filePath = Object.keys(fileDigest).find(
        path => fileDigest[path] === sha
      );
      
      if (!filePath) continue;
      
      const file = files.find(f => f.path === filePath);
      if (!file) continue;

      const uploadResponse = await fetch(
        `https://api.netlify.com/api/v1/deploys/${deployId}/files/${encodeURIComponent(filePath)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/octet-stream',
          },
          body: file.content,
        }
      );

      if (!uploadResponse.ok) {
        console.error(`Failed to upload ${filePath}`);
      }
    }

    // Step 5: Wait for deploy to be ready (poll status)
    let deployStatus = deploy.state;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (deployStatus !== 'ready' && deployStatus !== 'error' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.netlify.com/api/v1/deploys/${deployId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      deployStatus = statusData.state;
      attempts++;
    }

    if (deployStatus === 'error') {
      throw new Error('Deployment failed');
    }

    return {
      url: deploy.ssl_url || deploy.url,
      deployId: deploy.id,
      siteId: siteId,
      status: deployStatus,
    };

  } catch (error: any) {
    console.error('Netlify deployment error:', error);
    throw new Error(error.message || 'Failed to deploy to Netlify');
  }
}
